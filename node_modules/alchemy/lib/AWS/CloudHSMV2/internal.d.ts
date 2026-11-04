import * as cloudhsm from "@distilled.cloud/aws/cloudhsm-v2";
import * as Effect from "effect/Effect";
/**
 * Convert CloudHSM's `[{ Key, Value }]` tag list into a plain record.
 */
export declare const toTagRecord: (tags: ReadonlyArray<{
    Key?: string;
    Value?: string;
}> | undefined) => Record<string, string>;
/**
 * Look up a single CloudHSM cluster by its cluster id. `describeClusters` is
 * a filtered list — an unknown id simply yields an empty page, so a miss is
 * `undefined` rather than a typed NotFound.
 */
export declare const findClusterById: (clusterId: string) => Effect.Effect<cloudhsm.Cluster | undefined, cloudhsm.DescribeClustersError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/** True when two string sets are equal ignoring order and duplicates. */
export declare const sameStringSet: (a: readonly string[] | undefined, b: readonly string[] | undefined) => boolean;
//# sourceMappingURL=internal.d.ts.map