import { Region as AwsRegion } from "@distilled.cloud/aws/Region";
import * as wafv2 from "@distilled.cloud/aws/wafv2";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { diffTags } from "../../Tags.js";
const CLOUDFRONT_REGION = "us-east-1";
/**
 * WAFv2 `CLOUDFRONT`-scoped resources exist exclusively in `us-east-1`
 * (like ACM certificates for CloudFront). Pin the distilled `Region`
 * service for CLOUDFRONT scope; REGIONAL scope follows the ambient region.
 *
 * `AwsRegion`'s service value is an `Effect<RegionName>` (see
 * `@distilled.cloud/aws/Region`), so it must be provided as an effect, not a
 * bare string.
 *
 * @internal
 */
export const withWafScope = (scope, effect) => scope === "CLOUDFRONT"
    ? effect.pipe(Effect.provideService(AwsRegion, Effect.succeed(CLOUDFRONT_REGION)))
    : effect;
/**
 * WAFv2 mutations (update/delete) use `LockToken` optimistic concurrency.
 * The caller re-reads the entity (obtaining a fresh `LockToken`) inside
 * `self`, so retrying the whole effect on `WAFOptimisticLockException`
 * converges after concurrent writers.
 *
 * Explicitly typed: inlining `Effect.retry` with options in provider
 * lifecycle code widens the provider layer to `unknown` in declaration emit.
 *
 * @internal
 */
export const retryOptimisticLock = (self) => Effect.retry(self, {
    while: (e) => e._tag === "WAFOptimisticLockException",
    schedule: Schedule.max([Schedule.fixed("1 second"), Schedule.recurs(8)]),
});
/**
 * WAF changes take "a few seconds to a number of minutes" to propagate.
 * A freshly created web ACL (or rule group) referenced by another call —
 * or a freshly created protected resource (e.g. a Cognito user pool) that
 * WAF cannot "retrieve" yet — surfaces `WAFUnavailableEntityException`
 * until propagation completes. Retry it on a bounded schedule (~90s
 * total); fresh Cognito user pools routinely need more than 40s.
 *
 * @internal
 */
export const retryUnavailableEntity = (self) => Effect.retry(self, {
    while: (e) => e._tag === "WAFUnavailableEntityException",
    schedule: Schedule.max([Schedule.fixed("3 seconds"), Schedule.recurs(30)]),
});
/**
 * Like {@link retryUnavailableEntity} but with a ~150s budget. Associating
 * a web ACL with a freshly created protected resource (Cognito user pool,
 * ALB, …) surfaces `WAFUnavailableEntityException` until the resource
 * propagates to WAF — observed to routinely exceed 90s for new Cognito
 * user pools (Terraform retries this for 5 minutes).
 *
 * @internal
 */
export const retryUnavailableEntityLong = (self) => Effect.retry(self, {
    while: (e) => e._tag === "WAFUnavailableEntityException",
    schedule: Schedule.max([Schedule.fixed("3 seconds"), Schedule.recurs(50)]),
});
/**
 * Deleting a web ACL shortly after its association was removed can surface
 * `WAFAssociatedItemException` until disassociation propagates. Retry it
 * (and propagation-flavored unavailability) on a bounded schedule (~30s).
 *
 * @internal
 */
export const retryAssociatedItem = (self) => Effect.retry(self, {
    while: (e) => e._tag === "WAFAssociatedItemException" ||
        e._tag === "WAFUnavailableEntityException",
    schedule: Schedule.max([Schedule.fixed("2 seconds"), Schedule.recurs(15)]),
});
/**
 * Read the observed tags of a WAFv2 entity as a plain record.
 *
 * @internal
 */
export const fetchWafTags = Effect.fn(function* (scope, resourceArn) {
    const tags = {};
    let marker;
    // WAF tag sets are small; bound pagination defensively.
    for (let page = 0; page < 10; page++) {
        const response = yield* withWafScope(scope, wafv2.listTagsForResource({
            ResourceARN: resourceArn,
            NextMarker: marker,
            Limit: 100,
        }));
        const list = response.TagInfoForResource?.TagList ?? [];
        for (const tag of list) {
            tags[tag.Key] = tag.Value;
        }
        // WAF returns an empty-string NextMarker on the terminal page.
        if (!response.NextMarker || list.length === 0) {
            break;
        }
        marker = response.NextMarker;
    }
    return tags;
});
/**
 * Sync a WAFv2 entity's tags to the desired set by diffing against the
 * OBSERVED cloud tags (never `olds`/`output`).
 *
 * @internal
 */
export const syncWafTags = Effect.fn(function* (scope, resourceArn, desiredTags) {
    const observed = yield* fetchWafTags(scope, resourceArn);
    const { removed, upsert } = diffTags(observed, desiredTags);
    if (upsert.length > 0) {
        yield* withWafScope(scope, wafv2.tagResource({ ResourceARN: resourceArn, Tags: upsert }));
    }
    if (removed.length > 0) {
        yield* withWafScope(scope, wafv2.untagResource({ ResourceARN: resourceArn, TagKeys: removed }));
    }
});
/**
 * Restore `ByteMatchStatement.SearchString` blobs inside a rule tree.
 *
 * Resource props survive the engine's plan/state serialization as plain
 * JSON, so a `Uint8Array` SearchString arrives at the provider as an
 * index-keyed object (`{ "0": 47, ... }`) or a number array. Distilled
 * requires a real `Uint8Array` to base64-encode the blob on the wire, so
 * walk the (recursive) statement tree and coerce every SearchString back.
 *
 * @internal
 */
export const normalizeWafRules = (rules) => (rules ?? []).map((rule) => normalizeRuleValue(rule));
const normalizeRuleValue = (value) => {
    if (value instanceof Uint8Array) {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map(normalizeRuleValue);
    }
    if (value !== null && typeof value === "object") {
        return Object.fromEntries(Object.entries(value).map(([key, nested]) => [
            key,
            key === "SearchString"
                ? toSearchString(nested)
                : normalizeRuleValue(nested),
        ]));
    }
    return value;
};
const toSearchString = (value) => {
    if (value instanceof Uint8Array) {
        return value;
    }
    if (typeof value === "string") {
        return new TextEncoder().encode(value);
    }
    if (Array.isArray(value)) {
        return Uint8Array.from(value);
    }
    if (value !== null && typeof value === "object") {
        // Index-keyed object — integer keys iterate in ascending order.
        return Uint8Array.from(Object.values(value));
    }
    return new Uint8Array();
};
//# sourceMappingURL=internal.js.map