import * as pipes from "@distilled.cloud/aws/pipes";
import * as Layer from "effect/Layer";
import { makePipesHttpBinding } from "./BindingHttp.js";
import { StartPipe } from "./StartPipe.js";
export const StartPipeHttp = Layer.effect(StartPipe, makePipesHttpBinding({
    tag: "AWS.Pipes.StartPipe",
    operation: pipes.startPipe,
    actions: ["pipes:StartPipe"],
}));
//# sourceMappingURL=StartPipeHttp.js.map