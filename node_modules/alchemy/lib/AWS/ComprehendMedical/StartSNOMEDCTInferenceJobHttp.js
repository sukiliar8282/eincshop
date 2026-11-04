import * as comprehendmedical from "@distilled.cloud/aws/comprehendmedical";
import * as Layer from "effect/Layer";
import { makeComprehendMedicalHttpBinding } from "./BindingHttp.js";
import { StartSNOMEDCTInferenceJob } from "./StartSNOMEDCTInferenceJob.js";
export const StartSNOMEDCTInferenceJobHttp = Layer.effect(StartSNOMEDCTInferenceJob, makeComprehendMedicalHttpBinding({
    capability: "StartSNOMEDCTInferenceJob",
    iamActions: ["comprehendmedical:StartSNOMEDCTInferenceJob"],
    operation: comprehendmedical.startSNOMEDCTInferenceJob,
    passRole: true,
}));
//# sourceMappingURL=StartSNOMEDCTInferenceJobHttp.js.map