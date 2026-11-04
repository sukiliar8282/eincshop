import * as lf from "@distilled.cloud/aws/lakeformation";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { observePrincipalPermissions, retryWhileConcurrentModification, retryWhileInvalidPrincipal, } from "./internal.js";
import { toWireResource, } from "./ResourceSpec.js";
/**
 * A Lake Formation permission grant — gives a principal permissions on a
 * Data Catalog resource (database, table, data location, LF-tag, or LF-tag
 * policy expression). The resource owns the full permission set for its
 * principal/resource pair: permissions removed from the props are revoked.
 *
 * The caller must be a Lake Formation data lake administrator (or hold the
 * grant option on the resource) — see
 * {@link DataLakeSettings | AWS.LakeFormation.DataLakeSettings}.
 *
 * ### Granting Permissions
 * **Example:** Grant Database Permissions to a Role
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const database = yield* AWS.Glue.Database("Analytics", {});
 * const grant = yield* AWS.LakeFormation.Permissions("AnalystDbAccess", {
 *   principal: analystRole.roleArn,
 *   resource: { database: { name: database.databaseName } },
 *   permissions: ["DESCRIBE", "CREATE_TABLE"],
 * });
 * ```
 *
 * **Example:** Grant Table Select with Grant Option
 * ```typescript
 * const grant = yield* AWS.LakeFormation.Permissions("AnalystTableAccess", {
 *   principal: analystRole.roleArn,
 *   resource: {
 *     table: { databaseName: database.databaseName, tableWildcard: true },
 *   },
 *   permissions: ["SELECT", "DESCRIBE"],
 *   permissionsWithGrantOption: ["SELECT"],
 * });
 * ```
 *
 * **Example:** Grant Data Location Access
 * ```typescript
 * const grant = yield* AWS.LakeFormation.Permissions("EtlLocationAccess", {
 *   principal: etlRole.roleArn,
 *   resource: { dataLocation: { resourceArn: location.resourceArn } },
 *   permissions: ["DATA_LOCATION_ACCESS"],
 * });
 * ```
 *
 * @resource
 */
export const Permissions = Resource("AWS.LakeFormation.Permissions");
const dedupeSort = (values) => [...new Set(values)].sort();
export const PermissionsProvider = () => Provider.effect(Permissions, Effect.gen(function* () {
    return Permissions.Provider.of({
        stables: ["principal", "resource", "catalogId"],
        list: () => Effect.gen(function* () {
            const pages = yield* lf.listPermissions
                .pages({})
                .pipe(Stream.runCollect);
            return Array.from(pages)
                .flatMap((page) => page.PrincipalResourcePermissions ?? [])
                .filter((e) => e.Principal?.DataLakePrincipalIdentifier !== undefined &&
                e.Resource !== undefined)
                .map((e) => ({
                principal: e.Principal.DataLakePrincipalIdentifier,
                resource: e.Resource,
                permissions: dedupeSort([...(e.Permissions ?? [])]),
                permissionsWithGrantOption: dedupeSort([
                    ...(e.PermissionsWithGrantOption ?? []),
                ]),
                catalogId: undefined,
            }));
        }),
        read: Effect.fn(function* ({ olds, output }) {
            const principal = output?.principal ?? olds?.principal;
            const resource = output?.resource ??
                (olds !== undefined ? toWireResource(olds.resource) : undefined);
            if (principal === undefined || resource === undefined) {
                return undefined;
            }
            const catalogId = output?.catalogId ?? olds?.catalogId;
            const current = yield* observePrincipalPermissions(principal, resource, catalogId).pipe(
            // a deleted IAM principal surfaces as "Invalid principal" — the
            // grant is effectively gone.
            Effect.catchTag("InvalidLakeFormationPrincipal", () => Effect.succeed({
                permissions: [],
                permissionsWithGrantOption: [],
            })));
            if (current.permissions.length === 0)
                return undefined;
            return {
                principal,
                resource,
                permissions: current.permissions,
                permissionsWithGrantOption: current.permissionsWithGrantOption,
                catalogId,
            };
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            if (news.principal !== olds.principal) {
                return { action: "replace" };
            }
            if (JSON.stringify(toWireResource(news.resource)) !==
                JSON.stringify(toWireResource(olds.resource))) {
                return { action: "replace" };
            }
            if ((news.catalogId ?? undefined) !== (olds.catalogId ?? undefined)) {
                return { action: "replace" };
            }
            // permissions / permissionsWithGrantOption → update
        }),
        reconcile: Effect.fn(function* ({ news, session }) {
            const resource = toWireResource(news.resource);
            const principal = {
                DataLakePrincipalIdentifier: news.principal,
            };
            const desired = dedupeSort(news.permissions);
            const desiredGrant = dedupeSort(news.permissionsWithGrantOption ?? []);
            // 1. OBSERVE — retry through IAM propagation of a fresh principal.
            let current = yield* observePrincipalPermissions(news.principal, resource, news.catalogId).pipe(retryWhileInvalidPrincipal);
            // 2. SYNC — revoke stale grants, then grant the desired set
            //    (GrantPermissions is an idempotent upsert).
            const stale = current.permissions.filter((p) => !desired.includes(p));
            if (stale.length > 0) {
                yield* lf
                    .revokePermissions({
                    CatalogId: news.catalogId,
                    Principal: principal,
                    Resource: resource,
                    Permissions: stale,
                    PermissionsWithGrantOption: stale.some((p) => current.permissionsWithGrantOption.includes(p))
                        ? stale.filter((p) => current.permissionsWithGrantOption.includes(p))
                        : undefined,
                })
                    .pipe(retryWhileConcurrentModification);
            }
            // grant-option-only removals (permission kept, option dropped):
            // revoke the pair, the grant below restores the plain permission.
            const staleOptionOnly = current.permissionsWithGrantOption.filter((p) => !desiredGrant.includes(p) && desired.includes(p));
            if (staleOptionOnly.length > 0) {
                yield* lf
                    .revokePermissions({
                    CatalogId: news.catalogId,
                    Principal: principal,
                    Resource: resource,
                    Permissions: staleOptionOnly,
                    PermissionsWithGrantOption: staleOptionOnly,
                })
                    .pipe(retryWhileConcurrentModification);
            }
            const missing = desired.filter((p) => !current.permissions.includes(p));
            const missingGrant = desiredGrant.filter((p) => !current.permissionsWithGrantOption.includes(p));
            if (missing.length > 0 ||
                missingGrant.length > 0 ||
                staleOptionOnly.length > 0) {
                yield* lf
                    .grantPermissions({
                    CatalogId: news.catalogId,
                    Principal: principal,
                    Resource: resource,
                    Permissions: desired,
                    PermissionsWithGrantOption: desiredGrant.length > 0 ? desiredGrant : undefined,
                })
                    .pipe(retryWhileInvalidPrincipal, retryWhileConcurrentModification);
            }
            // 3. RETURN fresh state
            current = yield* observePrincipalPermissions(news.principal, resource, news.catalogId);
            yield* session.note(`${news.principal} ← [${current.permissions.join(", ")}]`);
            return {
                principal: news.principal,
                resource,
                permissions: current.permissions,
                permissionsWithGrantOption: current.permissionsWithGrantOption,
                catalogId: news.catalogId,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            // Observe first so we only revoke what actually exists (revoking a
            // non-existent grant is an InvalidInputException).
            const current = yield* observePrincipalPermissions(output.principal, output.resource, output.catalogId).pipe(Effect.catchTag("InvalidLakeFormationPrincipal", () => Effect.succeed({
                permissions: [],
                permissionsWithGrantOption: [],
            })));
            if (current.permissions.length === 0)
                return;
            yield* lf
                .revokePermissions({
                CatalogId: output.catalogId,
                Principal: { DataLakePrincipalIdentifier: output.principal },
                Resource: output.resource,
                Permissions: current.permissions,
                PermissionsWithGrantOption: current.permissionsWithGrantOption.length > 0
                    ? current.permissionsWithGrantOption
                    : undefined,
            })
                .pipe(retryWhileConcurrentModification, Effect.catchTag("EntityNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=Permissions.js.map