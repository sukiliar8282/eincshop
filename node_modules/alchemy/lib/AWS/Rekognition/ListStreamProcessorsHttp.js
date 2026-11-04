import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { ListStreamProcessors } from "./ListStreamProcessors.js";
export const ListStreamProcessorsHttp = Layer.effect(ListStreamProcessors, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.ListStreamProcessors",
    operation: rekognition.listStreamProcessors,
    actions: ["rekognition:ListStreamProcessors"],
}));
//# sourceMappingURL=ListStreamProcessorsHttp.js.map