import * as polly from "@distilled.cloud/aws/polly";
import * as Layer from "effect/Layer";
import { makePollyHttpBinding } from "./BindingHttp.js";
import { StartSpeechSynthesisStream } from "./StartSpeechSynthesisStream.js";
export const StartSpeechSynthesisStreamHttp = Layer.effect(StartSpeechSynthesisStream, makePollyHttpBinding({
    capability: "StartSpeechSynthesisStream",
    iamActions: ["polly:StartSpeechSynthesisStream"],
    operation: polly.startSpeechSynthesisStream,
}));
//# sourceMappingURL=StartSpeechSynthesisStreamHttp.js.map