import * as comprehendmedical from "@distilled.cloud/aws/comprehendmedical";
import * as Layer from "effect/Layer";
import { makeComprehendMedicalHttpBinding } from "./BindingHttp.js";
import { StopSNOMEDCTInferenceJob } from "./StopSNOMEDCTInferenceJob.js";
export const StopSNOMEDCTInferenceJobHttp = Layer.effect(StopSNOMEDCTInferenceJob, makeComprehendMedicalHttpBinding({
    capability: "StopSNOMEDCTInferenceJob",
    iamActions: ["comprehendmedical:StopSNOMEDCTInferenceJob"],
    operation: comprehendmedical.stopSNOMEDCTInferenceJob,
}));
//# sourceMappingURL=StopSNOMEDCTInferenceJobHttp.js.map