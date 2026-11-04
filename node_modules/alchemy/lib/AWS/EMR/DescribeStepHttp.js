import * as emr from "@distilled.cloud/aws/emr";
import * as Layer from "effect/Layer";
import { makeEmrClusterHttpBinding } from "./BindingHttp.js";
import { DescribeStep } from "./DescribeStep.js";
export const DescribeStepHttp = Layer.effect(DescribeStep, makeEmrClusterHttpBinding({
    tag: "AWS.EMR.DescribeStep",
    operation: emr.describeStep,
    actions: ["elasticmapreduce:DescribeStep"],
}));
//# sourceMappingURL=DescribeStepHttp.js.map