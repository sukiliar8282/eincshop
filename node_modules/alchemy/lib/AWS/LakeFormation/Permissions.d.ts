import * as lf from "@distilled.cloud/aws/lakeformation";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import { type LakeFormationResourceSpec } from "./ResourceSpec.ts";
export interface PermissionsProps {
    /**
     * The principal receiving the permissions — an IAM user/role ARN, an
     * external account id, or the `IAM_ALLOWED_PRINCIPALS` group. Changing it
     * replaces the grant.
     */
    principal: string;
    /**
     * The Lake Formation resource the permissions apply to (exactly one
     * variant set). Changing it replaces the grant.
     */
    resource: LakeFormationResourceSpec;
    /**
     * The permissions to grant (e.g. `["DESCRIBE"]`, `["SELECT"]`, `["ALL"]`).
     */
    permissions: lf.Permission[];
    /**
     * The subset of permissions the principal may also grant to others.
     */
    permissionsWithGrantOption?: lf.Permission[];
    /**
     * The catalog id (AWS account id). Changing it replaces the grant.
     * @default the caller's account
     */
    catalogId?: string;
}
export interface Permissions extends Resource<"AWS.LakeFormation.Permissions", PermissionsProps, {
    principal: string;
    resource: lf.Resource;
    permissions: lf.Permission[];
    permissionsWithGrantOption: lf.Permission[];
    catalogId: string | undefined;
}, {}, Providers> {
}
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
export declare const Permissions: import("../../Resource.ts").ResourceClass<Permissions>;
export declare const PermissionsProvider: () => import("effect/Layer").Layer<Provider.Provider<Permissions>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Permissions.d.ts.map