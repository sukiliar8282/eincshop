import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { GetCelebrityRecognition } from "./GetCelebrityRecognition.js";
export const GetCelebrityRecognitionHttp = Layer.effect(GetCelebrityRecognition, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.GetCelebrityRecognition",
    operation: rekognition.getCelebrityRecognition,
    actions: ["rekognition:GetCelebrityRecognition"],
}));
//# sourceMappingURL=GetCelebrityRecognitionHttp.js.map