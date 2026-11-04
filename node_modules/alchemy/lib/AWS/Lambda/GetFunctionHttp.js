import * as Lambda from "@distilled.cloud/aws/lambda";
import * as Layer from "effect/Layer";
import { makeFunctionHttpBinding } from "./BindingHttp.js";
import { GetFunction } from "./GetFunction.js";
export const GetFunctionHttp = Layer.effect(GetFunction, makeFunctionHttpBinding({
    tag: "AWS.Lambda.GetFunction",
    operation: Lambda.getFunction,
    actions: ["lambda:GetFunction"],
}));
//# sourceMappingURL=GetFunctionHttp.js.map