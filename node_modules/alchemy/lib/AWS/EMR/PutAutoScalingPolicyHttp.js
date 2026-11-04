import * as emr from "@distilled.cloud/aws/emr";
import * as Layer from "effect/Layer";
import { makeEmrClusterHttpBinding } from "./BindingHttp.js";
import { PutAutoScalingPolicy } from "./PutAutoScalingPolicy.js";
export const PutAutoScalingPolicyHttp = Layer.effect(PutAutoScalingPolicy, makeEmrClusterHttpBinding({
    tag: "AWS.EMR.PutAutoScalingPolicy",
    operation: emr.putAutoScalingPolicy,
    actions: ["elasticmapreduce:PutAutoScalingPolicy"],
}));
//# sourceMappingURL=PutAutoScalingPolicyHttp.js.map