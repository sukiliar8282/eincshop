import * as dax from "@distilled.cloud/aws/dax";
import * as Effect from "effect/Effect";
/**
 * Convert DAX's `[{ Key, Value }]` tag list into a plain record, dropping any
 * entry missing a key or value.
 */
export const toTagRecord = (tags) => Object.fromEntries((tags ?? [])
    .filter((tag) => typeof tag.Key === "string" && typeof tag.Value === "string")
    .map((tag) => [tag.Key, tag.Value]));
/**
 * Read the observed tags for a DAX cluster by ARN. A cluster that is
 * mid-transition (creating/modifying) transiently rejects `listTags` with
 * InvalidClusterStateFault; treat any failure as "no observed tags" so tag
 * reconciliation still runs on the next pass.
 */
export const readDaxTags = Effect.fn(function* (arn) {
    const response = yield* dax
        .listTags({ ResourceName: arn })
        .pipe(Effect.catch(() => Effect.succeed(undefined)));
    return toTagRecord(response?.Tags);
});
/** True when two string sets are equal ignoring order and duplicates. */
export const sameStringSet = (a, b) => {
    const left = [...new Set(a ?? [])].sort();
    const right = [...new Set(b ?? [])].sort();
    return left.length === right.length && left.every((v, i) => v === right[i]);
};
//# sourceMappingURL=internal.js.map