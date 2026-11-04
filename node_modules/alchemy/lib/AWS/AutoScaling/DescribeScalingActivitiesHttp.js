import * as autoscaling from "@distilled.cloud/aws/auto-scaling";
import * as Layer from "effect/Layer";
import { makeGroupHttpBinding } from "./BindingHttp.js";
import { DescribeScalingActivities } from "./DescribeScalingActivities.js";
export const DescribeScalingActivitiesHttp = Layer.effect(DescribeScalingActivities, makeGroupHttpBinding({
    tag: "AWS.AutoScaling.DescribeScalingActivities",
    operation: autoscaling.describeScalingActivities,
    actions: ["autoscaling:DescribeScalingActivities"],
    resource: "*",
}));
//# sourceMappingURL=DescribeScalingActivitiesHttp.js.map