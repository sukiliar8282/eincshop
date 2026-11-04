import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { GetCelebrityInfo } from "./GetCelebrityInfo.js";
export const GetCelebrityInfoHttp = Layer.effect(GetCelebrityInfo, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.GetCelebrityInfo",
    operation: rekognition.getCelebrityInfo,
    actions: ["rekognition:GetCelebrityInfo"],
}));
//# sourceMappingURL=GetCelebrityInfoHttp.js.map