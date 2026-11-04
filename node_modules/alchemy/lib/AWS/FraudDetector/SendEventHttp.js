import * as frauddetector from "@distilled.cloud/aws/frauddetector";
import * as Layer from "effect/Layer";
import { makeFraudDetectorEventTypeHttpBinding } from "./BindingHttp.js";
import { SendEvent } from "./SendEvent.js";
export const SendEventHttp = Layer.effect(SendEvent, makeFraudDetectorEventTypeHttpBinding({
    tag: "AWS.FraudDetector.SendEvent",
    operation: frauddetector.sendEvent,
    actions: ["frauddetector:SendEvent"],
}));
//# sourceMappingURL=SendEventHttp.js.map