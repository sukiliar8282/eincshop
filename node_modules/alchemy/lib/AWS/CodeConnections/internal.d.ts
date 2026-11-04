import * as codeconnections from "@distilled.cloud/aws/codeconnections";
import * as Effect from "effect/Effect";
/**
 * Shared tag plumbing for the CodeConnections resources (Connection, Host,
 * RepositoryLink). All three share the same `TagResource`/`UntagResource`/
 * `ListTagsForResource` wire shape keyed by ARN.
 *
 * NOT exported from `index.ts`.
 */
/** Convert a CodeConnections wire tag list into a plain record. */
export declare const toTagRecord: (tags: ReadonlyArray<{
    Key?: string;
    Value?: string;
}> | undefined) => Record<string, string>;
/** Convert a plain record into the CodeConnections wire tag list. */
export declare const toTagList: (tags: Record<string, string>) => {
    Key: string;
    Value: string;
}[];
/** Read the observed cloud tags for a CodeConnections resource ARN. */
export declare const fetchObservedTags: (arn: string) => Effect.Effect<Record<string, string> | {}, import("@distilled.cloud/aws/Errors").CommonErrors, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Converge a CodeConnections resource's tags to `desiredTags`, diffing
 * against the OBSERVED cloud tags (adoption may bring foreign tags).
 */
export declare const syncResourceTags: (arn: string, desiredTags: Record<string, string>) => Effect.Effect<void, codeconnections.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=internal.d.ts.map