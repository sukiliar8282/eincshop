import * as comprehendmedical from "@distilled.cloud/aws/comprehendmedical";
import * as Layer from "effect/Layer";
import { makeComprehendMedicalHttpBinding } from "./BindingHttp.js";
import { ListICD10CMInferenceJobs } from "./ListICD10CMInferenceJobs.js";
export const ListICD10CMInferenceJobsHttp = Layer.effect(ListICD10CMInferenceJobs, makeComprehendMedicalHttpBinding({
    capability: "ListICD10CMInferenceJobs",
    iamActions: ["comprehendmedical:ListICD10CMInferenceJobs"],
    operation: comprehendmedical.listICD10CMInferenceJobs,
}));
//# sourceMappingURL=ListICD10CMInferenceJobsHttp.js.map