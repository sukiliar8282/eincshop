import * as Effect from "effect/Effect";
/**
 * Convert MemoryDB's `[{ Key, Value }]` tag list into a plain record,
 * dropping any entry missing a key or value.
 */
export declare const toTagRecord: (tags: Array<{
    Key?: string;
    Value?: string;
}> | undefined) => Record<string, string>;
/**
 * Read the observed tags for a MemoryDB resource by ARN. A resource that has
 * just been created (or is mid-transition) can transiently reject `listTags`;
 * treat any failure as "no observed tags" so tag reconciliation still runs.
 */
export declare const readMemoryDbTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/** True when two string sets are equal ignoring order and duplicates. */
export declare const sameStringSet: (a: readonly string[] | undefined, b: readonly string[] | undefined) => boolean;
//# sourceMappingURL=internal.d.ts.map