import * as comprehendmedical from "@distilled.cloud/aws/comprehendmedical";
import * as Layer from "effect/Layer";
import { makeComprehendMedicalHttpBinding } from "./BindingHttp.js";
import { StartEntitiesDetectionV2Job } from "./StartEntitiesDetectionV2Job.js";
export const StartEntitiesDetectionV2JobHttp = Layer.effect(StartEntitiesDetectionV2Job, makeComprehendMedicalHttpBinding({
    capability: "StartEntitiesDetectionV2Job",
    iamActions: ["comprehendmedical:StartEntitiesDetectionV2Job"],
    operation: comprehendmedical.startEntitiesDetectionV2Job,
    passRole: true,
}));
//# sourceMappingURL=StartEntitiesDetectionV2JobHttp.js.map