import * as pipes from "@distilled.cloud/aws/pipes";
import * as Layer from "effect/Layer";
import { makePipesAccountHttpBinding } from "./BindingHttp.js";
import { ListPipes } from "./ListPipes.js";
export const ListPipesHttp = Layer.effect(ListPipes, makePipesAccountHttpBinding({
    tag: "AWS.Pipes.ListPipes",
    operation: pipes.listPipes,
    actions: ["pipes:ListPipes"],
}));
//# sourceMappingURL=ListPipesHttp.js.map