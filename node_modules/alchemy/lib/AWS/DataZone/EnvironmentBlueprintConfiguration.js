import * as datazone from "@distilled.cloud/aws/datazone";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { unredact } from "./internal.js";
/**
 * The account/domain configuration of an Amazon DataZone environment
 * blueprint — enables a managed blueprint (like `DefaultDataLake`) in
 * specific regions with the IAM roles DataZone should provision with.
 *
 * The blueprint itself is an AWS-managed definition; this resource owns only
 * its per-domain configuration (a `PUT`-style singleton keyed by domain +
 * blueprint).
 *
 * ### Configuring Blueprints
 * **Example:** Enable the DefaultDataLake Blueprint
 * ```typescript
 * import * as DataZone from "alchemy/AWS/DataZone";
 *
 * const config = yield* DataZone.EnvironmentBlueprintConfiguration(
 *   "datalake",
 *   {
 *     domainId: domain.domainId,
 *     environmentBlueprint: "DefaultDataLake",
 *     enabledRegions: ["us-west-2"],
 *     provisioningRoleArn: provisioningRole.roleArn,
 *     manageAccessRoleArn: manageAccessRole.roleArn,
 *     regionalParameters: {
 *       "us-west-2": { S3Location: "s3://my-datalake-bucket" },
 *     },
 *   },
 * );
 * ```
 *
 * **Example:** Blueprint with Lake Formation Provisioning
 * ```typescript
 * const config = yield* DataZone.EnvironmentBlueprintConfiguration(
 *   "datalake",
 *   {
 *     domainId: domain.domainId,
 *     environmentBlueprint: "DefaultDataLake",
 *     enabledRegions: ["us-west-2"],
 *     provisioningRoleArn: provisioningRole.roleArn,
 *     provisioningConfigurations: [
 *       {
 *         lakeFormationConfiguration: {
 *           locationRegistrationRole: registrationRole.roleArn,
 *         },
 *       },
 *     ],
 *   },
 * );
 * ```
 *
 * @resource
 */
export const EnvironmentBlueprintConfiguration = Resource("AWS.DataZone.EnvironmentBlueprintConfiguration");
/** No blueprint with the requested name or id exists in the domain. */
export class EnvironmentBlueprintNotFound extends Data.TaggedError("AWS.DataZone.EnvironmentBlueprintNotFound") {
}
/**
 * Freshly created IAM roles are eventually consistent; the PUT can
 * transiently reject a provisioning/manage-access role it cannot yet assume.
 * Wrapped in an explicitly-typed helper so the `Effect.retry` conditional
 * return type does not leak into declaration emit (see PATTERNS §7).
 */
const retryWhileRoleAssumeFails = (self) => Effect.retry(self, {
    while: (e) => (e._tag === "ValidationException" ||
        e._tag === "AccessDeniedException") &&
        "message" in e &&
        typeof e.message === "string" &&
        (e.message.toLowerCase().includes("role") ||
            e.message.toLowerCase().includes("assume")),
    schedule: Schedule.max([Schedule.fixed("3 seconds"), Schedule.recurs(10)]),
});
export const EnvironmentBlueprintConfigurationProvider = () => Provider.effect(EnvironmentBlueprintConfiguration, Effect.gen(function* () {
    // Resolve a blueprint name-or-id to its { id, name } within the domain.
    const resolveBlueprint = Effect.fn(function* (domainId, nameOrId) {
        const match = yield* datazone.listEnvironmentBlueprints
            .items({
            domainIdentifier: domainId,
            managed: true,
        })
            .pipe(Stream.filter((b) => b.name === nameOrId || b.id === nameOrId), Stream.runHead, Effect.map((head) => head._tag === "Some" ? head.value : undefined));
        if (match === undefined) {
            return yield* new EnvironmentBlueprintNotFound({
                domainId,
                environmentBlueprint: nameOrId,
            });
        }
        return { id: match.id, name: match.name };
    });
    // A deleted configuration — or one inside a deleted domain — is
    // reported as AccessDeniedException, NOT ResourceNotFoundException:
    // DataZone evaluates domain-scoped authorization before existence.
    // Both mean "absent".
    const getConfigurationOrUndefined = Effect.fn(function* (domainId, blueprintId) {
        return yield* datazone
            .getEnvironmentBlueprintConfiguration({
            domainIdentifier: domainId,
            environmentBlueprintIdentifier: blueprintId,
        })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)), Effect.catchTag("AccessDeniedException", () => Effect.succeed(undefined)));
    });
    return EnvironmentBlueprintConfiguration.Provider.of({
        stables: ["domainId", "environmentBlueprintId"],
        // Configurations are keyed by their parent domain — there is no
        // account-level enumeration without a domain identifier.
        list: () => Effect.succeed([]),
        read: Effect.fn(function* ({ olds, output }) {
            const domainId = output?.domainId ?? olds?.domainId;
            if (domainId === undefined)
                return undefined;
            const blueprint = output?.environmentBlueprintId
                ? {
                    id: output.environmentBlueprintId,
                    name: output.environmentBlueprintName,
                }
                : olds?.environmentBlueprint
                    ? yield* resolveBlueprint(domainId, olds.environmentBlueprint).pipe(Effect.catchTag("AWS.DataZone.EnvironmentBlueprintNotFound", () => Effect.succeed(undefined)), 
                    // the domain itself may already be gone (reported as
                    // NotFound or as AccessDenied — auth precedes existence)
                    Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)), Effect.catchTag("AccessDeniedException", () => Effect.succeed(undefined)))
                    : undefined;
            if (blueprint === undefined)
                return undefined;
            const config = yield* getConfigurationOrUndefined(domainId, blueprint.id);
            // An un-configured blueprint returns an empty configuration shell —
            // treat "no enabled regions and no roles" as absent.
            if (config === undefined ||
                ((config.enabledRegions ?? []).length === 0 &&
                    config.provisioningRoleArn === undefined &&
                    config.manageAccessRoleArn === undefined)) {
                return undefined;
            }
            // Blueprint configurations have no tags — ownership is tracked
            // purely by identity.
            return {
                domainId: config.domainId,
                environmentBlueprintId: config.environmentBlueprintId,
                environmentBlueprintName: blueprint.name,
                enabledRegions: [...(config.enabledRegions ?? [])],
                provisioningRoleArn: config.provisioningRoleArn,
                manageAccessRoleArn: config.manageAccessRoleArn,
            };
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            if (olds === undefined)
                return undefined;
            if (olds.domainId !== news.domainId) {
                return { action: "replace" };
            }
            if (olds.environmentBlueprint !== news.environmentBlueprint) {
                return { action: "replace" };
            }
            // regions, roles, and parameters converge via the idempotent PUT.
        }),
        reconcile: Effect.fn(function* ({ news, output, session }) {
            const domainId = news.domainId;
            const blueprint = output?.environmentBlueprintId
                ? {
                    id: output.environmentBlueprintId,
                    name: output.environmentBlueprintName,
                }
                : yield* resolveBlueprint(domainId, news.environmentBlueprint);
            // PutEnvironmentBlueprintConfiguration is a true upsert — one call
            // converges greenfield, update, and adoption alike.
            const config = yield* retryWhileRoleAssumeFails(datazone.putEnvironmentBlueprintConfiguration({
                domainIdentifier: domainId,
                environmentBlueprintIdentifier: blueprint.id,
                enabledRegions: news.enabledRegions,
                provisioningRoleArn: news.provisioningRoleArn,
                manageAccessRoleArn: news.manageAccessRoleArn,
                environmentRolePermissionBoundary: news.environmentRolePermissionBoundary,
                regionalParameters: news.regionalParameters,
                globalParameters: news.globalParameters,
                provisioningConfigurations: news.provisioningConfigurations,
            }));
            yield* session.note(`${blueprint.name} (${blueprint.id})`);
            return {
                domainId: config.domainId,
                environmentBlueprintId: config.environmentBlueprintId,
                environmentBlueprintName: blueprint.name,
                enabledRegions: [...(config.enabledRegions ?? news.enabledRegions)],
                provisioningRoleArn: config.provisioningRoleArn,
                manageAccessRoleArn: config.manageAccessRoleArn,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* datazone
                .deleteEnvironmentBlueprintConfiguration({
                domainIdentifier: output.domainId,
                environmentBlueprintIdentifier: output.environmentBlueprintId,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void), 
            // deleting a configuration whose domain is already gone
            // surfaces as AccessDenied — auth is checked before existence.
            Effect.catchTag("AccessDeniedException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=EnvironmentBlueprintConfiguration.js.map