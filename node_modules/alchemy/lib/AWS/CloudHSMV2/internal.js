import * as cloudhsm from "@distilled.cloud/aws/cloudhsm-v2";
import * as Effect from "effect/Effect";
/**
 * Convert CloudHSM's `[{ Key, Value }]` tag list into a plain record.
 */
export const toTagRecord = (tags) => Object.fromEntries((tags ?? [])
    .filter((tag) => typeof tag.Key === "string" && typeof tag.Value === "string")
    .map((tag) => [tag.Key, tag.Value]));
/**
 * Look up a single CloudHSM cluster by its cluster id. `describeClusters` is
 * a filtered list — an unknown id simply yields an empty page, so a miss is
 * `undefined` rather than a typed NotFound.
 */
export const findClusterById = Effect.fn(function* (clusterId) {
    const response = yield* cloudhsm.describeClusters({
        Filters: { clusterIds: [clusterId] },
    });
    return response.Clusters?.[0];
});
/** True when two string sets are equal ignoring order and duplicates. */
export const sameStringSet = (a, b) => {
    const left = [...new Set(a ?? [])].sort();
    const right = [...new Set(b ?? [])].sort();
    return left.length === right.length && left.every((v, i) => v === right[i]);
};
//# sourceMappingURL=internal.js.map