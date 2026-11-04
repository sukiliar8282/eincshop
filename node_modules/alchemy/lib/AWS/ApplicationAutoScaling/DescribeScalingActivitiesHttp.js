import * as aas from "@distilled.cloud/aws/application-auto-scaling";
import * as Layer from "effect/Layer";
import { makeTargetScopedHttpBinding } from "./BindingHttp.js";
import { DescribeScalingActivities } from "./DescribeScalingActivities.js";
export const DescribeScalingActivitiesHttp = Layer.effect(DescribeScalingActivities, makeTargetScopedHttpBinding({
    tag: "AWS.ApplicationAutoScaling.DescribeScalingActivities",
    operation: aas.describeScalingActivities,
    actions: ["application-autoscaling:DescribeScalingActivities"],
}));
//# sourceMappingURL=DescribeScalingActivitiesHttp.js.map