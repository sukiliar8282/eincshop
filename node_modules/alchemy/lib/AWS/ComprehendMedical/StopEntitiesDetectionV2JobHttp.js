import * as comprehendmedical from "@distilled.cloud/aws/comprehendmedical";
import * as Layer from "effect/Layer";
import { makeComprehendMedicalHttpBinding } from "./BindingHttp.js";
import { StopEntitiesDetectionV2Job } from "./StopEntitiesDetectionV2Job.js";
export const StopEntitiesDetectionV2JobHttp = Layer.effect(StopEntitiesDetectionV2Job, makeComprehendMedicalHttpBinding({
    capability: "StopEntitiesDetectionV2Job",
    iamActions: ["comprehendmedical:StopEntitiesDetectionV2Job"],
    operation: comprehendmedical.stopEntitiesDetectionV2Job,
}));
//# sourceMappingURL=StopEntitiesDetectionV2JobHttp.js.map