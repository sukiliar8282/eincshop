import * as comprehendmedical from "@distilled.cloud/aws/comprehendmedical";
import * as Layer from "effect/Layer";
import { makeComprehendMedicalHttpBinding } from "./BindingHttp.js";
import { ListPHIDetectionJobs } from "./ListPHIDetectionJobs.js";
export const ListPHIDetectionJobsHttp = Layer.effect(ListPHIDetectionJobs, makeComprehendMedicalHttpBinding({
    capability: "ListPHIDetectionJobs",
    iamActions: ["comprehendmedical:ListPHIDetectionJobs"],
    operation: comprehendmedical.listPHIDetectionJobs,
}));
//# sourceMappingURL=ListPHIDetectionJobsHttp.js.map