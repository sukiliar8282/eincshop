import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { StartCelebrityRecognition } from "./StartCelebrityRecognition.js";
export const StartCelebrityRecognitionHttp = Layer.effect(StartCelebrityRecognition, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.StartCelebrityRecognition",
    operation: rekognition.startCelebrityRecognition,
    actions: ["rekognition:StartCelebrityRecognition"],
}));
//# sourceMappingURL=StartCelebrityRecognitionHttp.js.map