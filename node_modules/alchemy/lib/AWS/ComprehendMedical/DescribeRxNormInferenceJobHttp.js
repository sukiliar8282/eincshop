import * as comprehendmedical from "@distilled.cloud/aws/comprehendmedical";
import * as Layer from "effect/Layer";
import { makeComprehendMedicalHttpBinding } from "./BindingHttp.js";
import { DescribeRxNormInferenceJob } from "./DescribeRxNormInferenceJob.js";
export const DescribeRxNormInferenceJobHttp = Layer.effect(DescribeRxNormInferenceJob, makeComprehendMedicalHttpBinding({
    capability: "DescribeRxNormInferenceJob",
    iamActions: ["comprehendmedical:DescribeRxNormInferenceJob"],
    operation: comprehendmedical.describeRxNormInferenceJob,
}));
//# sourceMappingURL=DescribeRxNormInferenceJobHttp.js.map