import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { StartPersonTracking } from "./StartPersonTracking.js";
export const StartPersonTrackingHttp = Layer.effect(StartPersonTracking, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.StartPersonTracking",
    operation: rekognition.startPersonTracking,
    actions: ["rekognition:StartPersonTracking"],
}));
//# sourceMappingURL=StartPersonTrackingHttp.js.map