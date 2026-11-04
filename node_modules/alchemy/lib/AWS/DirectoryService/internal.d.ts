import * as Effect from "effect/Effect";
/**
 * Convert Directory Service's `[{ Key, Value }]` tag list into a plain
 * record, dropping any entry missing a key or value.
 */
export declare const toTagRecord: (tags: ReadonlyArray<{
    Key?: string;
    Value?: string;
}> | undefined) => Record<string, string>;
/**
 * Read the observed tags for a directory by id. A directory mid-transition
 * (or already deleted out of band) can reject `listTagsForResource`; treat
 * any failure as "no observed tags" so tag reconciliation still converges on
 * the next pass.
 */
export declare const readDirectoryTags: (directoryId: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/** True when two string sets are equal ignoring order and duplicates. */
export declare const sameStringSet: (a: readonly string[] | undefined, b: readonly string[] | undefined) => boolean;
//# sourceMappingURL=internal.d.ts.map