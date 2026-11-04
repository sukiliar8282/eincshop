import * as comprehendmedical from "@distilled.cloud/aws/comprehendmedical";
import * as Layer from "effect/Layer";
import { makeComprehendMedicalHttpBinding } from "./BindingHttp.js";
import { ListSNOMEDCTInferenceJobs } from "./ListSNOMEDCTInferenceJobs.js";
export const ListSNOMEDCTInferenceJobsHttp = Layer.effect(ListSNOMEDCTInferenceJobs, makeComprehendMedicalHttpBinding({
    capability: "ListSNOMEDCTInferenceJobs",
    iamActions: ["comprehendmedical:ListSNOMEDCTInferenceJobs"],
    operation: comprehendmedical.listSNOMEDCTInferenceJobs,
}));
//# sourceMappingURL=ListSNOMEDCTInferenceJobsHttp.js.map