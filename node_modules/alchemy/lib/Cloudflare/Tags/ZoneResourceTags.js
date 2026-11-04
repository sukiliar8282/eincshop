import * as resourceTagging from "@distilled.cloud/cloudflare/resource-tagging";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { recordsEqual } from "../../Util/equal.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.Tags.ZoneResourceTags";
// A target resource (e.g. a freshly-created DNS record) propagates
// eventually-consistently to Cloudflare's tag index; the tag API answers
// `ZoneTagResourceNotFound` (404) until it appears. Bounded-retry the tag
// calls on that typed tag so reconcile waits out the propagation window.
const targetVisibleRetry = {
    while: (e) => e._tag === "ZoneTagResourceNotFound",
    schedule: Schedule.max([
        Schedule.exponential("500 millis"),
        Schedule.recurs(10),
    ]),
};
/**
 * Key/value tags attached to a zone-level Cloudflare resource via the
 * unified resource-tagging API (open beta).
 *
 * The tag SET is the resource: `PUT` replaces the full set, and deleting
 * this resource clears every tag from the target. Cloudflare reports an
 * untagged (or unknown) resource as an empty tag set rather than a 404, so
 * an empty set is treated as "absent".
 *
 * Safety: tags carry no ownership markers. On a cold read (no prior state)
 * a non-empty tag set on the target resource is reported as `Unowned`, and
 * the engine refuses to take it over (i.e. clobber the existing tags)
 * unless `--adopt` or `adopt(true)` is set.
 * ### Tagging a resource
 * **Example:** Tag a DNS record
 * ```typescript
 * const record = yield* Cloudflare.DNS.Record("api", {
 *   zoneId: zone.zoneId,
 *   name: "api.example.com",
 *   type: "A",
 *   content: "203.0.113.42",
 * });
 *
 * yield* Cloudflare.Tags.ZoneResourceTags("api-tags", {
 *   zoneId: zone.zoneId,
 *   resourceType: "dns_record",
 *   resourceId: record.recordId,
 *   tags: { team: "platform", env: "production" },
 * });
 * ```
 *
 * **Example:** Tag the zone itself
 * ```typescript
 * yield* Cloudflare.Tags.ZoneResourceTags("zone-tags", {
 *   zoneId: zone.zoneId,
 *   resourceType: "zone",
 *   resourceId: zone.zoneId,
 *   tags: { "cost-center": "eng-42" },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/fundamentals/account/tags/
 *
 * @resource
 * @product Resource Tagging
 * @category Account & Identity
 */
export const ZoneResourceTags = Resource(TypeId);
/**
 * Returns true if the given value is a ZoneResourceTags resource.
 */
export const isZoneResourceTags = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const ZoneResourceTagsProvider = () => Provider.succeed(ZoneResourceTags, {
    stables: ["zoneId", "resourceType", "resourceId", "accessApplicationId"],
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // The account-wide `GET /accounts/{id}/tags/resources` enumerates
        // every tagged resource in the account in one paginated call. The
        // zone-scoped variants (the ones this resource manages) are exactly
        // those that carry a `zoneId` in the response union; account-level
        // variants (worker, kv_namespace, …) lack it and are filtered out.
        return yield* resourceTagging.listResourceTaggings
            .pages({ accountId })
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? [])
            .filter((item) => "zoneId" in item)
            .map((item) => ({
            zoneId: item.zoneId,
            resourceType: item.type,
            resourceId: item.id,
            accessApplicationId: "accessApplicationId" in item
                ? item.accessApplicationId
                : undefined,
            tags: narrowTags(item.tags),
            etag: item.etag,
        })))));
    }),
    diff: Effect.fn(function* ({ olds = {}, news }) {
        const o = olds;
        const n = news;
        if (o.resourceType !== undefined && o.resourceType !== n.resourceType) {
            return { action: "replace" };
        }
        // zoneId / resourceId / accessApplicationId are Input<string>; by
        // diff time persisted olds are concrete strings — compare only when
        // both sides are.
        if (typeof o.zoneId === "string" &&
            typeof n.zoneId === "string" &&
            o.zoneId !== n.zoneId) {
            return { action: "replace" };
        }
        if (typeof o.resourceId === "string" &&
            typeof n.resourceId === "string" &&
            o.resourceId !== n.resourceId) {
            return { action: "replace" };
        }
        if (typeof o.accessApplicationId === "string" &&
            typeof n.accessApplicationId === "string" &&
            o.accessApplicationId !== n.accessApplicationId) {
            return { action: "replace" };
        }
    }),
    read: Effect.fn(function* ({ output, olds }) {
        const zoneId = output?.zoneId ?? olds?.zoneId;
        const resourceId = output?.resourceId ?? olds?.resourceId;
        const resourceType = output?.resourceType ?? olds?.resourceType;
        const accessApplicationId = output?.accessApplicationId ??
            olds?.accessApplicationId;
        if (!zoneId || !resourceId || !resourceType)
            return undefined;
        const observed = yield* resourceTagging
            .getZoneTag({
            zoneId,
            resourceId,
            resourceType,
            accessApplicationId,
        })
            // A 404 means the target resource no longer exists; its tags are
            // gone with it.
            .pipe(Effect.catchTag("ZoneTagResourceNotFound", () => Effect.succeed(undefined)));
        if (observed === undefined)
            return undefined;
        const tags = narrowTags(observed.tags);
        // Cloudflare reports untagged (and unknown) resources as an empty
        // tag set — that is "gone" for this resource.
        if (Object.keys(tags).length === 0)
            return undefined;
        const attrs = {
            zoneId,
            resourceType,
            resourceId,
            accessApplicationId,
            tags,
            etag: observed.etag,
        };
        // Cold read without prior state: a non-empty tag set exists but we
        // cannot prove we created it (tags carry no ownership markers), so
        // gate takeover behind the adopt policy.
        return output ? attrs : Unowned(attrs);
    }),
    reconcile: Effect.fn(function* ({ news }) {
        // Inputs have been resolved to concrete strings by Plan.
        const zoneId = news.zoneId;
        const resourceId = news.resourceId;
        const accessApplicationId = news.accessApplicationId;
        const desired = resolveTags(news.tags);
        // Observe — cloud state is authoritative. The GET never 404s for a
        // valid-but-untagged resource (it returns an empty tag set), so the
        // same call covers greenfield, update, and adoption. It *does* 404
        // (`ZoneTagResourceNotFound`) when the target resource itself isn't
        // visible yet — a freshly-created DNS record propagates eventually-
        // consistently to the tag index — so bounded-retry until it appears.
        const observed = yield* resourceTagging
            .getZoneTag({
            zoneId,
            resourceId,
            resourceType: news.resourceType,
            accessApplicationId,
        })
            .pipe(Effect.retry(targetVisibleRetry));
        // Sync — PUT is a full replace, so the only decision is whether the
        // observed set already equals the desired set (skip the write).
        if (recordsEqual(narrowTags(observed.tags), desired)) {
            return {
                zoneId,
                resourceType: news.resourceType,
                resourceId,
                accessApplicationId,
                tags: desired,
                etag: observed.etag,
            };
        }
        const updated = yield* resourceTagging
            .putZoneTag({
            zoneId,
            resourceId,
            resourceType: news.resourceType,
            accessApplicationId,
            tags: desired,
        })
            .pipe(Effect.retry(targetVisibleRetry));
        return {
            zoneId,
            resourceType: news.resourceType,
            resourceId,
            accessApplicationId,
            tags: narrowTags(updated.tags),
            etag: updated.etag,
        };
    }),
    delete: Effect.fn(function* ({ output }) {
        // The DELETE endpoint is idempotent — Cloudflare returns 204 even
        // for resources that were never tagged.
        yield* resourceTagging.deleteZoneTag({
            zoneId: output.zoneId,
            resourceId: output.resourceId,
            resourceType: output.resourceType,
            accessApplicationId: output.accessApplicationId,
        });
    }),
});
/** Narrow distilled's `Record<string, unknown>` tag values to strings. */
const narrowTags = (tags) => Object.fromEntries(Object.entries(tags).map(([k, v]) => [k, String(v)]));
/** Resolve `Input<string>` tag values (already concrete after Plan). */
const resolveTags = (tags) => Object.fromEntries(Object.entries(tags).map(([k, v]) => [k, v]));
//# sourceMappingURL=ZoneResourceTags.js.map