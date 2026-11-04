import * as entityresolution from "@distilled.cloud/aws/entityresolution";
import * as Effect from "effect/Effect";
/**
 * Coerce an Entity Resolution wire tag map (values decode as
 * `string | undefined`) into a plain `Record<string, string>`.
 */
export declare const toTagRecord: (tags: {
    [key: string]: string | undefined;
} | undefined) => Record<string, string>;
/**
 * Read the observed tags of an Entity Resolution resource by ARN. The
 * `Get*` operations do NOT return tags even when they exist, so ownership
 * checks must go through `listTagsForResource`. Tag reads are best-effort —
 * a failure (e.g. a race with deletion) reports no tags.
 */
export declare const readEntityResolutionTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync tags on an Entity Resolution resource: diff the OBSERVED cloud tags
 * against the desired set and apply only the delta.
 */
export declare const syncEntityResolutionTags: (arn: string, desiredTags: Record<string, string>) => Effect.Effect<void, entityresolution.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Retry the IAM-propagation race on workflow create/update: a freshly created
 * role is transiently rejected until IAM propagates. The race surfaces as
 * `AccessDeniedException` with either `Exception in assuming the passed
 * role ...` (the role itself hasn't propagated) or `The service does not
 * have access to read your data in Glue/S3 ...` (the role resolved but its
 * just-attached policy hasn't). Bounded; explicitly typed as a pipeable
 * helper so declaration emit stays clean (inlining `Effect.retry` erases
 * `E`/`R` to `unknown` for every consumer).
 */
export declare const retryRolePropagation: <A, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
//# sourceMappingURL=internal.d.ts.map