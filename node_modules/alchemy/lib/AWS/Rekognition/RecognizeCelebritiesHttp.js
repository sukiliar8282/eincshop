import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { RecognizeCelebrities } from "./RecognizeCelebrities.js";
export const RecognizeCelebritiesHttp = Layer.effect(RecognizeCelebrities, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.RecognizeCelebrities",
    operation: rekognition.recognizeCelebrities,
    actions: ["rekognition:RecognizeCelebrities"],
}));
//# sourceMappingURL=RecognizeCelebritiesHttp.js.map