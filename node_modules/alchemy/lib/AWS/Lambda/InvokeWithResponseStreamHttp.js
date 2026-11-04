import * as Lambda from "@distilled.cloud/aws/lambda";
import * as Layer from "effect/Layer";
import { makeFunctionHttpBinding } from "./BindingHttp.js";
import { InvokeWithResponseStream } from "./InvokeWithResponseStream.js";
export const InvokeWithResponseStreamHttp = Layer.effect(InvokeWithResponseStream, makeFunctionHttpBinding({
    tag: "AWS.Lambda.InvokeWithResponseStream",
    operation: Lambda.invokeWithResponseStream,
    actions: ["lambda:InvokeFunction"],
}));
//# sourceMappingURL=InvokeWithResponseStreamHttp.js.map