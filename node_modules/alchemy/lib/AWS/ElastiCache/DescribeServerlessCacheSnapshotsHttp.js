import * as elasticache from "@distilled.cloud/aws/elasticache";
import * as Layer from "effect/Layer";
import { makeElastiCacheAccountHttpBinding } from "./BindingHttp.js";
import { DescribeServerlessCacheSnapshots } from "./DescribeServerlessCacheSnapshots.js";
export const DescribeServerlessCacheSnapshotsHttp = Layer.effect(DescribeServerlessCacheSnapshots, makeElastiCacheAccountHttpBinding({
    tag: "AWS.ElastiCache.DescribeServerlessCacheSnapshots",
    operation: elasticache.describeServerlessCacheSnapshots,
    actions: ["elasticache:DescribeServerlessCacheSnapshots"],
}));
//# sourceMappingURL=DescribeServerlessCacheSnapshotsHttp.js.map