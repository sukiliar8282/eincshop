import * as comprehendmedical from "@distilled.cloud/aws/comprehendmedical";
import * as Layer from "effect/Layer";
import { makeComprehendMedicalHttpBinding } from "./BindingHttp.js";
import { StartPHIDetectionJob } from "./StartPHIDetectionJob.js";
export const StartPHIDetectionJobHttp = Layer.effect(StartPHIDetectionJob, makeComprehendMedicalHttpBinding({
    capability: "StartPHIDetectionJob",
    iamActions: ["comprehendmedical:StartPHIDetectionJob"],
    operation: comprehendmedical.startPHIDetectionJob,
    passRole: true,
}));
//# sourceMappingURL=StartPHIDetectionJobHttp.js.map