import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { GetPersonTracking } from "./GetPersonTracking.js";
export const GetPersonTrackingHttp = Layer.effect(GetPersonTracking, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.GetPersonTracking",
    operation: rekognition.getPersonTracking,
    actions: ["rekognition:GetPersonTracking"],
}));
//# sourceMappingURL=GetPersonTrackingHttp.js.map