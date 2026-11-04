import * as comprehendmedical from "@distilled.cloud/aws/comprehendmedical";
import * as Layer from "effect/Layer";
import { makeComprehendMedicalHttpBinding } from "./BindingHttp.js";
import { StartICD10CMInferenceJob } from "./StartICD10CMInferenceJob.js";
export const StartICD10CMInferenceJobHttp = Layer.effect(StartICD10CMInferenceJob, makeComprehendMedicalHttpBinding({
    capability: "StartICD10CMInferenceJob",
    iamActions: ["comprehendmedical:StartICD10CMInferenceJob"],
    operation: comprehendmedical.startICD10CMInferenceJob,
    passRole: true,
}));
//# sourceMappingURL=StartICD10CMInferenceJobHttp.js.map