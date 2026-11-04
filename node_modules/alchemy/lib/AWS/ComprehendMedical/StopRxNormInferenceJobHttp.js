import * as comprehendmedical from "@distilled.cloud/aws/comprehendmedical";
import * as Layer from "effect/Layer";
import { makeComprehendMedicalHttpBinding } from "./BindingHttp.js";
import { StopRxNormInferenceJob } from "./StopRxNormInferenceJob.js";
export const StopRxNormInferenceJobHttp = Layer.effect(StopRxNormInferenceJob, makeComprehendMedicalHttpBinding({
    capability: "StopRxNormInferenceJob",
    iamActions: ["comprehendmedical:StopRxNormInferenceJob"],
    operation: comprehendmedical.stopRxNormInferenceJob,
}));
//# sourceMappingURL=StopRxNormInferenceJobHttp.js.map