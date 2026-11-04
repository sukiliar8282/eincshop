import * as polly from "@distilled.cloud/aws/polly";
import * as Layer from "effect/Layer";
import { makePollyHttpBinding } from "./BindingHttp.js";
import { StartSpeechSynthesisTask } from "./StartSpeechSynthesisTask.js";
export const StartSpeechSynthesisTaskHttp = Layer.effect(StartSpeechSynthesisTask, makePollyHttpBinding({
    capability: "StartSpeechSynthesisTask",
    iamActions: ["polly:StartSpeechSynthesisTask"],
    operation: polly.startSpeechSynthesisTask,
}));
//# sourceMappingURL=StartSpeechSynthesisTaskHttp.js.map