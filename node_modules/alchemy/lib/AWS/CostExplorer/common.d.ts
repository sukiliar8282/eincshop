import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Effect from "effect/Effect";
export declare const CE_REGION: "us-east-1";
export declare const pinCe: <A, E extends {
    _tag: string;
}, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/** Convert a plain tag record to Cost Explorer's `ResourceTag` list shape. */
export declare const toResourceTags: (tags: Record<string, string>) => ce.ResourceTag[];
/** Convert a Cost Explorer `ResourceTag` list to a plain tag record. */
export declare const toTagRecord: (tags: readonly ce.ResourceTag[] | undefined) => Record<string, string>;
/**
 * Fetch the observed tags for a Cost Explorer resource ARN. Tolerates the
 * resource disappearing mid-read (`ResourceNotFoundException` → `{}`).
 */
export declare const fetchCeTags: (resourceArn: string) => Effect.Effect<Record<string, string>, ce.LimitExceededException | import("@distilled.cloud/aws/Errors").CommonErrors, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync the tags on a Cost Explorer resource: diff the OBSERVED cloud tags
 * against the desired set and apply only the delta.
 */
export declare const syncCeTags: (resourceArn: string, desiredTags: Record<string, string>) => Effect.Effect<void, ce.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=common.d.ts.map