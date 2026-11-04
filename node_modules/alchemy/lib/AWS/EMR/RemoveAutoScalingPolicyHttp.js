import * as emr from "@distilled.cloud/aws/emr";
import * as Layer from "effect/Layer";
import { makeEmrClusterHttpBinding } from "./BindingHttp.js";
import { RemoveAutoScalingPolicy } from "./RemoveAutoScalingPolicy.js";
export const RemoveAutoScalingPolicyHttp = Layer.effect(RemoveAutoScalingPolicy, makeEmrClusterHttpBinding({
    tag: "AWS.EMR.RemoveAutoScalingPolicy",
    operation: emr.removeAutoScalingPolicy,
    actions: ["elasticmapreduce:RemoveAutoScalingPolicy"],
}));
//# sourceMappingURL=RemoveAutoScalingPolicyHttp.js.map