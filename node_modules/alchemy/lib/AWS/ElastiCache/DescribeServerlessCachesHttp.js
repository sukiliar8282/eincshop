import * as elasticache from "@distilled.cloud/aws/elasticache";
import * as Layer from "effect/Layer";
import { makeElastiCacheAccountHttpBinding } from "./BindingHttp.js";
import { DescribeServerlessCaches } from "./DescribeServerlessCaches.js";
export const DescribeServerlessCachesHttp = Layer.effect(DescribeServerlessCaches, makeElastiCacheAccountHttpBinding({
    tag: "AWS.ElastiCache.DescribeServerlessCaches",
    operation: elasticache.describeServerlessCaches,
    actions: ["elasticache:DescribeServerlessCaches"],
}));
//# sourceMappingURL=DescribeServerlessCachesHttp.js.map