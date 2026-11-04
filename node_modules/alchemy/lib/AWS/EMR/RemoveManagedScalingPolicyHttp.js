import * as emr from "@distilled.cloud/aws/emr";
import * as Layer from "effect/Layer";
import { makeEmrClusterHttpBinding } from "./BindingHttp.js";
import { RemoveManagedScalingPolicy } from "./RemoveManagedScalingPolicy.js";
export const RemoveManagedScalingPolicyHttp = Layer.effect(RemoveManagedScalingPolicy, makeEmrClusterHttpBinding({
    tag: "AWS.EMR.RemoveManagedScalingPolicy",
    operation: emr.removeManagedScalingPolicy,
    actions: ["elasticmapreduce:RemoveManagedScalingPolicy"],
}));
//# sourceMappingURL=RemoveManagedScalingPolicyHttp.js.map