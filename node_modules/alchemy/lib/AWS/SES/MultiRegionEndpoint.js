import * as sesv2 from "@distilled.cloud/aws/sesv2";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, createTagsList, diffTags, hasAlchemyTags, } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
/**
 * An Amazon SES v2 multi-region endpoint (global endpoint) — a single sending
 * endpoint that splits email traffic across a primary region (where the
 * endpoint is created) and one or more secondary regions, improving
 * resilience and deliverability.
 *
 * :::note
 * Provisioning is asynchronous and can take a while: creation returns
 * immediately with status `CREATING`, and the endpoint only becomes usable
 * once it reaches `READY`. This resource does **not** wait for `READY` — the
 * `status` attribute reflects the value observed when reconcile returned.
 * Poll `getMultiRegionEndpoint` yourself if you need to block on readiness.
 * :::
 *
 * There is no update API, so any change to the name or routes replaces the
 * endpoint.
 * ### Creating Endpoints
 * **Example:** Two-Region Endpoint
 * ```typescript
 * import * as SES from "alchemy/AWS/SES";
 *
 * // The primary region is wherever the stack deploys; the route adds a
 * // secondary region.
 * const endpoint = yield* SES.MultiRegionEndpoint("Global", {
 *   regions: ["eu-west-1"],
 * });
 * ```
 *
 * **Example:** Three-Region Endpoint
 * ```typescript
 * // Traffic is split across the primary region plus every listed route.
 * const endpoint = yield* SES.MultiRegionEndpoint("Global", {
 *   regions: ["eu-west-1", "ap-southeast-2"],
 * });
 * ```
 *
 * **Example:** Explicit Endpoint Name
 * ```typescript
 * const endpoint = yield* SES.MultiRegionEndpoint("Global", {
 *   endpointName: "acme-global",
 *   regions: ["eu-west-1"],
 * });
 * ```
 *
 * ### Waiting for READY
 * **Example:** Poll Until the Endpoint Is Usable
 * ```typescript
 * import * as sesv2 from "@distilled.cloud/aws/sesv2";
 * import * as Effect from "effect/Effect";
 * import * as Schedule from "effect/Schedule";
 *
 * const endpoint = yield* SES.MultiRegionEndpoint("Global", {
 *   regions: ["eu-west-1"],
 * });
 *
 * // Reconcile returns as soon as SES accepts the create, so status is
 * // usually CREATING. Poll yourself when you need to block on readiness.
 * const ready = yield* sesv2
 *   .getMultiRegionEndpoint({ EndpointName: yield* endpoint.endpointName })
 *   .pipe(
 *     Effect.repeat({
 *       schedule: Schedule.spaced("30 seconds"),
 *       until: (r) => r.Status === "READY",
 *       times: 40,
 *     }),
 *   );
 * ```
 *
 * @resource
 */
export const MultiRegionEndpoint = Resource("AWS.SES.MultiRegionEndpoint");
const toTagRecord = (tags) => Object.fromEntries((tags ?? []).map((tag) => [tag.Key, tag.Value]));
// getMultiRegionEndpoint returns no ARN, so the ARN listTagsForResource needs
// is derived from the endpoint NAME (not its id) — verified live.
const endpointArnOf = (region, accountId, name) => `arn:aws:ses:${region}:${accountId}:multi-region-endpoint/${name}`;
const sameRegions = (a, b) => {
    const key = (regions) => JSON.stringify([...(regions ?? [])].sort());
    return key(a) === key(b);
};
export const MultiRegionEndpointProvider = () => Provider.effect(MultiRegionEndpoint, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.endpointName ??
            (yield* createPhysicalName({ id, maxLength: 64 })));
    });
    const getEndpoint = Effect.fn(function* (name) {
        return yield* sesv2
            .getMultiRegionEndpoint({ EndpointName: name })
            .pipe(Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
    });
    // getMultiRegionEndpoint does not return tags, so ownership costs a
    // second API call. Only `read` pays it — `list` deletes by name.
    const getEndpointTags = Effect.fn(function* (name) {
        const { accountId, region } = yield* AWSEnvironment.current;
        return yield* sesv2
            .listTagsForResource({
            ResourceArn: endpointArnOf(region, accountId, name),
        })
            .pipe(Effect.map((response) => toTagRecord(response.Tags)), Effect.catchTag("NotFoundException", () => Effect.succeed({})));
    });
    return MultiRegionEndpoint.Provider.of({
        stables: ["endpointName", "endpointId"],
        // Account/region-scoped: enumerate every endpoint so leaked test
        // resources are cleaned by nuke.
        list: Effect.fn(function* () {
            const pages = yield* sesv2.listMultiRegionEndpoints
                .pages({})
                .pipe(Stream.runCollect);
            return Array.from(pages)
                .flatMap((page) => page.MultiRegionEndpoints ?? [])
                .flatMap((entry) => entry.EndpointName && entry.EndpointId
                ? [
                    {
                        endpointName: entry.EndpointName,
                        endpointId: entry.EndpointId,
                        status: entry.Status ?? "CREATING",
                    },
                ]
                : []);
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.endpointName ?? (yield* createName(id, olds ?? {}));
            const found = yield* getEndpoint(name);
            if (!found || !found.EndpointId)
                return undefined;
            const attrs = {
                endpointName: name,
                endpointId: found.EndpointId,
                status: found.Status ?? "CREATING",
            };
            // Endpoints are taggable and reconcile brands the ones it creates,
            // so existence at our deterministic name is not proof of ownership.
            const tags = yield* getEndpointTags(name);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds ?? {});
            const newName = yield* createName(id, news ?? {});
            // No update API: a rename or any routing change replaces the
            // endpoint.
            if (oldName !== newName ||
                !sameRegions(olds?.regions, news.regions)) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.endpointName ?? (yield* createName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // 1. OBSERVE — cloud state is authoritative.
            let observed = yield* getEndpoint(name);
            if (observed === undefined) {
                // 2. ENSURE — create; AlreadyExists is a race, not a failure.
                //    Provisioning is asynchronous: creation returns CREATING and we
                //    deliberately do NOT wait for READY (that exceeds the polling
                //    budget; downstream consumers poll if they need readiness).
                yield* sesv2
                    .createMultiRegionEndpoint({
                    EndpointName: name,
                    Details: {
                        RoutesDetails: news.regions.map((region) => ({
                            Region: region,
                        })),
                    },
                    Tags: createTagsList(desiredTags),
                })
                    .pipe(Effect.catchTag("AlreadyExistsException", () => Effect.succeed({})));
                // The endpoint is not always readable the instant create returns
                // (and on the AlreadyExists race another writer may still be
                // mid-create), so poll briefly rather than failing outright.
                observed = yield* getEndpoint(name).pipe(Effect.repeat({
                    schedule: Schedule.spaced("1 second"),
                    until: (endpoint) => endpoint !== undefined,
                    times: 8,
                }));
            }
            if (observed === undefined || !observed.EndpointId) {
                return yield* Effect.fail(new Error(`SES multi-region endpoint ${name} was not found after create`));
            }
            // 3. SYNC TAGS — diff against OBSERVED cloud tags so an adopted
            //    endpoint gets branded and stops reading as Unowned.
            const observedTags = yield* getEndpointTags(name);
            const { upsert, removed } = diffTags(observedTags, desiredTags);
            if (upsert.length > 0 || removed.length > 0) {
                const { accountId, region } = yield* AWSEnvironment.current;
                const endpointArn = endpointArnOf(region, accountId, name);
                if (upsert.length > 0) {
                    yield* sesv2.tagResource({
                        ResourceArn: endpointArn,
                        Tags: upsert,
                    });
                }
                if (removed.length > 0) {
                    yield* sesv2.untagResource({
                        ResourceArn: endpointArn,
                        TagKeys: removed,
                    });
                }
            }
            yield* session.note(observed.EndpointId);
            return {
                endpointName: name,
                endpointId: observed.EndpointId,
                status: observed.Status ?? "CREATING",
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            // deleteMultiRegionEndpoint is idempotent for a missing endpoint.
            //
            // Provisioning is asynchronous and reconcile deliberately returns at
            // CREATING, so a destroy that follows closely enough hits an endpoint
            // still coming up: SES answers ConcurrentModificationException
            // ("Unable to delete resource in PROVISIONING status"). That is
            // eventual consistency, not a failure — retry on a bounded schedule
            // until the endpoint settles and the delete takes.
            yield* sesv2
                .deleteMultiRegionEndpoint({ EndpointName: output.endpointName })
                .pipe(Effect.retry({
                while: (e) => e._tag === "ConcurrentModificationException",
                schedule: Schedule.max([
                    Schedule.spaced("5 seconds"),
                    Schedule.recurs(12),
                ]),
            }), Effect.catchTag("NotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=MultiRegionEndpoint.js.map