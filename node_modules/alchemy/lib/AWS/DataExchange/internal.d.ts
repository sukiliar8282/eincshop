import * as Effect from "effect/Effect";
/**
 * Coerce a DataExchange wire tag map (values decode as `string | undefined`)
 * into a plain `Record<string, string>`.
 */
export declare const toTagRecord: (tags: {
    [key: string]: string | undefined;
} | undefined) => Record<string, string>;
/**
 * Read the observed tags of a DataExchange resource by ARN. Tag reads are
 * best-effort — a failure (e.g. a race with deletion) reports no tags.
 */
export declare const readDataExchangeTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync tags on a DataExchange resource: diff the OBSERVED cloud tags against
 * the desired set and apply only the delta.
 */
export declare const syncDataExchangeTags: (arn: string, desiredTags: Record<string, string>) => Effect.Effect<void, import("@distilled.cloud/aws/Errors").CommonErrors, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=internal.d.ts.map