import * as comprehendmedical from "@distilled.cloud/aws/comprehendmedical";
import * as Layer from "effect/Layer";
import { makeComprehendMedicalHttpBinding } from "./BindingHttp.js";
import { StopICD10CMInferenceJob } from "./StopICD10CMInferenceJob.js";
export const StopICD10CMInferenceJobHttp = Layer.effect(StopICD10CMInferenceJob, makeComprehendMedicalHttpBinding({
    capability: "StopICD10CMInferenceJob",
    iamActions: ["comprehendmedical:StopICD10CMInferenceJob"],
    operation: comprehendmedical.stopICD10CMInferenceJob,
}));
//# sourceMappingURL=StopICD10CMInferenceJobHttp.js.map