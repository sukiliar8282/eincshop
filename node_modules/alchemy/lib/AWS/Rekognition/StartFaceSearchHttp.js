import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { StartFaceSearch } from "./StartFaceSearch.js";
export const StartFaceSearchHttp = Layer.effect(StartFaceSearch, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.StartFaceSearch",
    operation: rekognition.startFaceSearch,
    actions: ["rekognition:StartFaceSearch"],
}));
//# sourceMappingURL=StartFaceSearchHttp.js.map