import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { ListFaces } from "./ListFaces.js";
export const ListFacesHttp = Layer.effect(ListFaces, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.ListFaces",
    operation: rekognition.listFaces,
    actions: ["rekognition:ListFaces"],
}));
//# sourceMappingURL=ListFacesHttp.js.map