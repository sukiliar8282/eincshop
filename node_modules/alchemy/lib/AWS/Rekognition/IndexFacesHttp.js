import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { IndexFaces } from "./IndexFaces.js";
export const IndexFacesHttp = Layer.effect(IndexFaces, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.IndexFaces",
    operation: rekognition.indexFaces,
    actions: ["rekognition:IndexFaces"],
}));
//# sourceMappingURL=IndexFacesHttp.js.map