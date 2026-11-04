import * as route53 from "@distilled.cloud/aws/route-53";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags } from "../../Tags.js";
import { durationToSeconds } from "../IAM/common.js";
/**
 * A Route 53 health check.
 *
 * `HealthCheck` monitors the health of an endpoint and can gate failover and
 * other routing policies on a `Record` via `record.healthCheckId`.
 * ### Creating a Health Check
 * **Example:** HTTP Health Check
 * ```typescript
 * const check = yield* HealthCheck("ApiHealth", {
 *   type: "HTTP",
 *   fullyQualifiedDomainName: "api.example.com",
 *   resourcePath: "/health",
 *   port: 80,
 *   requestInterval: "30 seconds",
 *   failureThreshold: 3,
 * });
 * ```
 *
 * ### Gating DNS Failover
 * **Example:** Fail Over a Record When the Check Fails
 * ```typescript
 * const check = yield* HealthCheck("PrimaryHealth", {
 *   type: "HTTPS",
 *   fullyQualifiedDomainName: "primary.example.com",
 *   resourcePath: "/health",
 *   port: 443,
 * });
 * // Route 53 answers with the PRIMARY record only while the check passes;
 * // see `Record` for the matching SECONDARY record.
 * const primary = yield* Record("Primary", {
 *   hostedZoneId: zone.id,
 *   name: "app.example.com",
 *   type: "A",
 *   ttl: "60 seconds",
 *   records: ["1.2.3.4"],
 *   setIdentifier: "primary",
 *   failover: "PRIMARY",
 *   healthCheckId: check.id,
 * });
 * ```
 *
 * @resource
 */
export const HealthCheck = Resource("AWS.Route53.HealthCheck");
/**
 * Whether a Route 53 health check can be managed directly through Route 53.
 *
 * Health checks with `LinkedService` are owned by another AWS service (for
 * example, Cloud Map). Route 53 refuses direct deletion of those checks, and
 * the owning service may retain them as tombstones after its resource is
 * deleted. They therefore must not be returned to account-wide nuke inventory.
 */
export const isNukeableHealthCheck = (check) => check.LinkedService === undefined;
const toConfig = (props) => ({
    Type: props.type,
    IPAddress: props.ipAddress,
    Port: props.port,
    ResourcePath: props.resourcePath,
    FullyQualifiedDomainName: props.fullyQualifiedDomainName,
    SearchString: props.searchString,
    RequestInterval: durationToSeconds(props.requestInterval),
    FailureThreshold: props.failureThreshold,
    MeasureLatency: props.measureLatency,
    Inverted: props.inverted,
    Disabled: props.disabled,
    HealthThreshold: props.healthThreshold,
    ChildHealthChecks: props.childHealthChecks,
    EnableSNI: props.enableSNI,
    Regions: props.regions,
});
// Fields settable via UpdateHealthCheck (i.e. everything except the immutable
// Type / RequestInterval / MeasureLatency).
const mutableFields = (props) => ({
    IPAddress: props.ipAddress,
    Port: props.port,
    ResourcePath: props.resourcePath,
    FullyQualifiedDomainName: props.fullyQualifiedDomainName,
    SearchString: props.searchString,
    FailureThreshold: props.failureThreshold,
    Inverted: props.inverted,
    Disabled: props.disabled,
    HealthThreshold: props.healthThreshold,
    ChildHealthChecks: props.childHealthChecks,
    EnableSNI: props.enableSNI,
    Regions: props.regions,
});
const mutableDiffers = (observed, desired) => {
    const d = mutableFields(desired);
    return (observed.IPAddress !== d.IPAddress ||
        observed.Port !== d.Port ||
        observed.ResourcePath !== d.ResourcePath ||
        observed.FullyQualifiedDomainName !== d.FullyQualifiedDomainName ||
        observed.SearchString !== d.SearchString ||
        (observed.FailureThreshold ?? undefined) !== d.FailureThreshold ||
        (observed.Inverted ?? undefined) !== d.Inverted ||
        (observed.Disabled ?? undefined) !== d.Disabled ||
        (observed.HealthThreshold ?? undefined) !== d.HealthThreshold ||
        (observed.EnableSNI ?? undefined) !== d.EnableSNI);
};
export const HealthCheckProvider = () => Provider.effect(HealthCheck, Effect.gen(function* () {
    const observe = Effect.fn(function* (id) {
        return yield* route53.getHealthCheck({ HealthCheckId: id }).pipe(Effect.map((r) => r.HealthCheck), Effect.catchTag("NoSuchHealthCheck", () => Effect.succeed(undefined)));
    });
    const observedTags = Effect.fn(function* (id) {
        const response = yield* route53.listTagsForResource({
            ResourceType: "healthcheck",
            ResourceId: id,
        });
        const record = {};
        for (const tag of response.ResourceTagSet.Tags ?? []) {
            if (tag.Key !== undefined && tag.Value !== undefined) {
                record[tag.Key] = tag.Value;
            }
        }
        return record;
    });
    const syncTags = Effect.fn(function* (id, logicalId, userTags) {
        const internalTags = yield* createInternalTags(logicalId);
        const newTags = { ...userTags, ...internalTags };
        const oldTags = yield* observedTags(id);
        const { upsert, removed } = diffTags(oldTags, newTags);
        if (upsert.length === 0 && removed.length === 0) {
            return;
        }
        yield* route53.changeTagsForResource({
            ResourceType: "healthcheck",
            ResourceId: id,
            AddTags: upsert.length > 0 ? upsert : undefined,
            RemoveTagKeys: removed.length > 0 ? removed : undefined,
        });
    });
    return {
        stables: ["id", "healthCheckId"],
        list: () => route53.listHealthChecks.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.HealthChecks ?? [])
            .filter(isNukeableHealthCheck)
            .map((check) => ({
            id: check.Id,
            healthCheckId: check.Id,
            type: check.HealthCheckConfig.Type,
        }))))),
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return undefined;
            if (olds.type !== news.type ||
                (durationToSeconds(olds.requestInterval) ?? 30) !==
                    (durationToSeconds(news.requestInterval) ?? 30) ||
                (olds.measureLatency ?? false) !== (news.measureLatency ?? false)) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ output }) {
            if (!output?.id) {
                return undefined;
            }
            const check = yield* observe(output.id);
            if (!check) {
                return undefined;
            }
            return {
                id: check.Id,
                healthCheckId: check.Id,
                type: check.HealthCheckConfig.Type,
            };
        }),
        reconcile: Effect.fn(function* ({ id, instanceId, news, output }) {
            // Observe.
            let check = output?.id ? yield* observe(output.id) : undefined;
            // Ensure — CallerReference makes create idempotent.
            if (!check) {
                check = yield* route53
                    .createHealthCheck({
                    CallerReference: instanceId,
                    HealthCheckConfig: toConfig(news),
                })
                    .pipe(Effect.map((r) => r.HealthCheck), Effect.catchTag("HealthCheckAlreadyExists", () => 
                // Same CallerReference already created it; the engine stores
                // output, so on a true re-run output.id observes above. A bare
                // race here means we must re-read — but the API gives us no id,
                // so fall back to the stored output if present.
                output?.id
                    ? observe(output.id).pipe(Effect.flatMap((existing) => existing
                        ? Effect.succeed(existing)
                        : Effect.die(new Error("health check exists but could not be observed"))))
                    : Effect.die(new Error("health check already exists for caller reference"))));
            }
            // Sync config — diff observed mutable fields against desired.
            if (mutableDiffers(check.HealthCheckConfig, news)) {
                const updated = yield* route53
                    .updateHealthCheck({
                    HealthCheckId: check.Id,
                    HealthCheckVersion: check.HealthCheckVersion,
                    ...mutableFields(news),
                })
                    .pipe(Effect.map((r) => r.HealthCheck), 
                // Optimistic-lock retry: re-read for the latest version.
                Effect.retry({
                    while: (e) => e._tag === "HealthCheckVersionMismatch",
                    schedule: Schedule.max([
                        Schedule.fixed("1 second"),
                        Schedule.recurs(5),
                    ]),
                }));
                check = updated;
            }
            // Sync tags.
            yield* syncTags(check.Id, id, news.tags);
            return {
                id: check.Id,
                healthCheckId: check.Id,
                type: check.HealthCheckConfig.Type,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* route53.deleteHealthCheck({ HealthCheckId: output.id }).pipe(Effect.asVoid, Effect.catchTag("NoSuchHealthCheck", () => Effect.void), 
            // Still referenced by a record whose delete is propagating.
            Effect.retry({
                while: (e) => e._tag === "HealthCheckInUse",
                schedule: Schedule.max([
                    Schedule.fixed("3 seconds"),
                    Schedule.recurs(10),
                ]),
            }), Effect.catchTag("HealthCheckInUse", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=HealthCheck.js.map