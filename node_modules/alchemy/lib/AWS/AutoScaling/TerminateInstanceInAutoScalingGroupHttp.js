import * as autoscaling from "@distilled.cloud/aws/auto-scaling";
import * as Layer from "effect/Layer";
import { makeGroupHttpBinding } from "./BindingHttp.js";
import { TerminateInstanceInAutoScalingGroup } from "./TerminateInstanceInAutoScalingGroup.js";
export const TerminateInstanceInAutoScalingGroupHttp = Layer.effect(TerminateInstanceInAutoScalingGroup, makeGroupHttpBinding({
    tag: "AWS.AutoScaling.TerminateInstanceInAutoScalingGroup",
    operation: autoscaling.terminateInstanceInAutoScalingGroup,
    actions: ["autoscaling:TerminateInstanceInAutoScalingGroup"],
}));
//# sourceMappingURL=TerminateInstanceInAutoScalingGroupHttp.js.map