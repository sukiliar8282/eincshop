import * as frauddetector from "@distilled.cloud/aws/frauddetector";
import * as Layer from "effect/Layer";
import { makeFraudDetectorDetectorHttpBinding } from "./BindingHttp.js";
import { GetEventPredictionMetadata } from "./GetEventPredictionMetadata.js";
export const GetEventPredictionMetadataHttp = Layer.effect(GetEventPredictionMetadata, makeFraudDetectorDetectorHttpBinding({
    tag: "AWS.FraudDetector.GetEventPredictionMetadata",
    operation: frauddetector.getEventPredictionMetadata,
    actions: ["frauddetector:GetEventPredictionMetadata"],
}));
//# sourceMappingURL=GetEventPredictionMetadataHttp.js.map