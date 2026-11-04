import * as rekognition from "@distilled.cloud/aws/rekognition";
import * as Layer from "effect/Layer";
import { makeRekognitionHttpBinding } from "./BindingHttp.js";
import { StartProjectVersion } from "./StartProjectVersion.js";
export const StartProjectVersionHttp = Layer.effect(StartProjectVersion, makeRekognitionHttpBinding({
    tag: "AWS.Rekognition.StartProjectVersion",
    operation: rekognition.startProjectVersion,
    actions: ["rekognition:StartProjectVersion"],
}));
//# sourceMappingURL=StartProjectVersionHttp.js.map