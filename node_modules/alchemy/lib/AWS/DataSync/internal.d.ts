import * as datasync from "@distilled.cloud/aws/datasync";
import * as Effect from "effect/Effect";
/**
 * A freshly-created IAM role (or a just-attached inline policy) takes a
 * while to propagate to DataSync: `CreateLocation*` transiently rejects it
 * as `LocationRoleNotAssumable` (patched from `InvalidRequestException` +
 * "Invalid IAM role") or fails its location access test as
 * `LocationAccessTestFailed` (patched from `InvalidRequestException` +
 * "location access test failed"). Bounded retry (~60s), explicitly typed so
 * declaration emit never widens the provider layer (see PATTERNS §7).
 */
export declare const retryWhileRoleNotAssumable: <A, E extends {
    _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/** Convert a DataSync tag list to a plain record. */
export declare const dsTagsToRecord: (tags: readonly datasync.TagListEntry[] | undefined) => Record<string, string>;
/** Read the observed tags currently attached to a DataSync resource. */
export declare const readObservedTags: (resourceArn: string) => Effect.Effect<Record<string, string>, datasync.ListTagsForResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Diff observed cloud tags against the desired set and apply the delta.
 * DataSync `tagResource` upserts; `untagResource` removes by key.
 */
export declare const syncTags: (resourceArn: string, observed: Record<string, string>, desired: Record<string, string>) => Effect.Effect<void, datasync.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Scan every DataSync location and return the ARN of the one whose
 * `LocationUri` matches (ignoring a trailing slash). DataSync has no
 * create-idempotency token, so this makes reconcile idempotent across state
 * loss.
 */
export declare const findLocationArnByUri: (expectedUri: string) => Effect.Effect<string | undefined, datasync.ListLocationsError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=internal.d.ts.map