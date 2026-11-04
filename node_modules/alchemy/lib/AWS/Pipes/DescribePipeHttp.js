import * as pipes from "@distilled.cloud/aws/pipes";
import * as Layer from "effect/Layer";
import { makePipesHttpBinding } from "./BindingHttp.js";
import { DescribePipe } from "./DescribePipe.js";
export const DescribePipeHttp = Layer.effect(DescribePipe, makePipesHttpBinding({
    tag: "AWS.Pipes.DescribePipe",
    operation: pipes.describePipe,
    actions: ["pipes:DescribePipe"],
}));
//# sourceMappingURL=DescribePipeHttp.js.map