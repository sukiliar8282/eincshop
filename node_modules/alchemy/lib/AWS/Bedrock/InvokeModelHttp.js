import * as bedrock from "@distilled.cloud/aws/bedrock-runtime";
import * as Layer from "effect/Layer";
import { makeModelScopedHttpBinding } from "./BindingHttp.js";
import { InvokeModel } from "./InvokeModel.js";
export const InvokeModelHttp = Layer.effect(InvokeModel, makeModelScopedHttpBinding({
    tag: "AWS.Bedrock.InvokeModel",
    operation: bedrock.invokeModel,
    actions: ["bedrock:InvokeModel"],
}));
//# sourceMappingURL=InvokeModelHttp.js.map