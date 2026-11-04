import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { DisassociateFaces } from "./DisassociateFaces.js";
export const DisassociateFacesHttp = Layer.effect(DisassociateFaces, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.DisassociateFaces",
    operation: rekognition.disassociateFaces,
    actions: ["rekognition:DisassociateFaces"],
}));
//# sourceMappingURL=DisassociateFacesHttp.js.map