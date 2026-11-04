import * as elbv2 from "@distilled.cloud/aws/elastic-load-balancing-v2";
import * as Layer from "effect/Layer";
import { makeTargetGroupHttpBinding } from "./BindingHttp.js";
import { DescribeTargetHealth } from "./DescribeTargetHealth.js";
export const DescribeTargetHealthHttp = Layer.effect(DescribeTargetHealth, makeTargetGroupHttpBinding({
    tag: "AWS.ELBv2.DescribeTargetHealth",
    operation: elbv2.describeTargetHealth,
    actions: ["elasticloadbalancing:DescribeTargetHealth"],
    resource: "*",
}));
//# sourceMappingURL=DescribeTargetHealthHttp.js.map