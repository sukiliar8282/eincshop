import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { GetFaceSearch } from "./GetFaceSearch.js";
export const GetFaceSearchHttp = Layer.effect(GetFaceSearch, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.GetFaceSearch",
    operation: rekognition.getFaceSearch,
    actions: ["rekognition:GetFaceSearch"],
}));
//# sourceMappingURL=GetFaceSearchHttp.js.map