import * as comprehendmedical from "@distilled.cloud/aws/comprehendmedical";
import * as Layer from "effect/Layer";
import { makeComprehendMedicalHttpBinding } from "./BindingHttp.js";
import { DescribeSNOMEDCTInferenceJob } from "./DescribeSNOMEDCTInferenceJob.js";
export const DescribeSNOMEDCTInferenceJobHttp = Layer.effect(DescribeSNOMEDCTInferenceJob, makeComprehendMedicalHttpBinding({
    capability: "DescribeSNOMEDCTInferenceJob",
    iamActions: ["comprehendmedical:DescribeSNOMEDCTInferenceJob"],
    operation: comprehendmedical.describeSNOMEDCTInferenceJob,
}));
//# sourceMappingURL=DescribeSNOMEDCTInferenceJobHttp.js.map