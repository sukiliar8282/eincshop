import * as comprehendmedical from "@distilled.cloud/aws/comprehendmedical";
import * as Layer from "effect/Layer";
import { makeComprehendMedicalHttpBinding } from "./BindingHttp.js";
import { StopPHIDetectionJob } from "./StopPHIDetectionJob.js";
export const StopPHIDetectionJobHttp = Layer.effect(StopPHIDetectionJob, makeComprehendMedicalHttpBinding({
    capability: "StopPHIDetectionJob",
    iamActions: ["comprehendmedical:StopPHIDetectionJob"],
    operation: comprehendmedical.stopPHIDetectionJob,
}));
//# sourceMappingURL=StopPHIDetectionJobHttp.js.map