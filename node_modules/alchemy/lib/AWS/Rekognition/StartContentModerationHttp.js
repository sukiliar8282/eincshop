import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { StartContentModeration } from "./StartContentModeration.js";
export const StartContentModerationHttp = Layer.effect(StartContentModeration, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.StartContentModeration",
    operation: rekognition.startContentModeration,
    actions: ["rekognition:StartContentModeration"],
}));
//# sourceMappingURL=StartContentModerationHttp.js.map