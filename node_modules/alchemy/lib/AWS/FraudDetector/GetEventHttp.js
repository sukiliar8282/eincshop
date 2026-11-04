import * as frauddetector from "@distilled.cloud/aws/frauddetector";
import * as Layer from "effect/Layer";
import { makeFraudDetectorEventTypeHttpBinding } from "./BindingHttp.js";
import { GetEvent } from "./GetEvent.js";
export const GetEventHttp = Layer.effect(GetEvent, makeFraudDetectorEventTypeHttpBinding({
    tag: "AWS.FraudDetector.GetEvent",
    operation: frauddetector.getEvent,
    actions: ["frauddetector:GetEvent"],
}));
//# sourceMappingURL=GetEventHttp.js.map