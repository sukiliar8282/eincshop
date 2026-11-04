import type * as WAFV2 from "@distilled.cloud/aws/wafv2";
import * as Effect from "effect/Effect";
/**
 * Scope of a WAFv2 resource.
 *
 * - `REGIONAL` — protects regional resources (ALB, API Gateway, AppSync,
 *   Cognito user pool, App Runner, Verified Access) and follows the ambient
 *   AWS region.
 * - `CLOUDFRONT` — protects CloudFront distributions and must live in
 *   `us-east-1`; the providers pin the region automatically.
 */
export type WafScope = "REGIONAL" | "CLOUDFRONT";
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
export declare const withWafScope: <A, E, R>(scope: WafScope, effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
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
export declare const retryOptimisticLock: <A, E extends {
    _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
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
export declare const retryUnavailableEntity: <A, E extends {
    _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * Like {@link retryUnavailableEntity} but with a ~150s budget. Associating
 * a web ACL with a freshly created protected resource (Cognito user pool,
 * ALB, …) surfaces `WAFUnavailableEntityException` until the resource
 * propagates to WAF — observed to routinely exceed 90s for new Cognito
 * user pools (Terraform retries this for 5 minutes).
 *
 * @internal
 */
export declare const retryUnavailableEntityLong: <A, E extends {
    _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * Deleting a web ACL shortly after its association was removed can surface
 * `WAFAssociatedItemException` until disassociation propagates. Retry it
 * (and propagation-flavored unavailability) on a bounded schedule (~30s).
 *
 * @internal
 */
export declare const retryAssociatedItem: <A, E extends {
    _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * Read the observed tags of a WAFv2 entity as a plain record.
 *
 * @internal
 */
export declare const fetchWafTags: (scope: WafScope, resourceArn: string) => Effect.Effect<Record<string, string>, WAFV2.ListTagsForResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync a WAFv2 entity's tags to the desired set by diffing against the
 * OBSERVED cloud tags (never `olds`/`output`).
 *
 * @internal
 */
export declare const syncWafTags: (scope: WafScope, resourceArn: string, desiredTags: Record<string, string>) => Effect.Effect<void, WAFV2.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
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
export declare const normalizeWafRules: (rules: WAFV2.Rule[] | undefined) => WAFV2.Rule[];
//# sourceMappingURL=internal.d.ts.map