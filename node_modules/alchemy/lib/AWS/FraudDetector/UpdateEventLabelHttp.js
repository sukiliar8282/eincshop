import * as frauddetector from "@distilled.cloud/aws/frauddetector";
import * as Layer from "effect/Layer";
import { makeFraudDetectorEventTypeHttpBinding } from "./BindingHttp.js";
import { UpdateEventLabel } from "./UpdateEventLabel.js";
export const UpdateEventLabelHttp = Layer.effect(UpdateEventLabel, makeFraudDetectorEventTypeHttpBinding({
    tag: "AWS.FraudDetector.UpdateEventLabel",
    operation: frauddetector.updateEventLabel,
    actions: ["frauddetector:UpdateEventLabel"],
}));
//# sourceMappingURL=UpdateEventLabelHttp.js.map