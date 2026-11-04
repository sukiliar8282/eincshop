import * as emr from "@distilled.cloud/aws/emr";
import * as Layer from "effect/Layer";
import { makeEmrClusterHttpBinding } from "./BindingHttp.js";
import { PutManagedScalingPolicy } from "./PutManagedScalingPolicy.js";
export const PutManagedScalingPolicyHttp = Layer.effect(PutManagedScalingPolicy, makeEmrClusterHttpBinding({
    tag: "AWS.EMR.PutManagedScalingPolicy",
    operation: emr.putManagedScalingPolicy,
    actions: ["elasticmapreduce:PutManagedScalingPolicy"],
}));
//# sourceMappingURL=PutManagedScalingPolicyHttp.js.map