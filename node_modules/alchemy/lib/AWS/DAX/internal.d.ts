import * as Effect from "effect/Effect";
/**
 * Convert DAX's `[{ Key, Value }]` tag list into a plain record, dropping any
 * entry missing a key or value.
 */
export declare const toTagRecord: (tags: Array<{
    Key?: string;
    Value?: string;
}> | undefined) => Record<string, string>;
/**
 * Read the observed tags for a DAX cluster by ARN. A cluster that is
 * mid-transition (creating/modifying) transiently rejects `listTags` with
 * InvalidClusterStateFault; treat any failure as "no observed tags" so tag
 * reconciliation still runs on the next pass.
 */
export declare const readDaxTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/** True when two string sets are equal ignoring order and duplicates. */
export declare const sameStringSet: (a: readonly string[] | undefined, b: readonly string[] | undefined) => boolean;
//# sourceMappingURL=internal.d.ts.map