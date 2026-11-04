import * as Lambda from "@distilled.cloud/aws/lambda";
import * as Layer from "effect/Layer";
import { makeFunctionHttpBinding } from "./BindingHttp.js";
import { InvokeFunction } from "./InvokeFunction.js";
export const InvokeFunctionHttp = Layer.effect(InvokeFunction, makeFunctionHttpBinding({
    tag: "AWS.Lambda.InvokeFunction",
    operation: Lambda.invoke,
    actions: ["lambda:InvokeFunction"],
}));
//# sourceMappingURL=InvokeFunctionHttp.js.map