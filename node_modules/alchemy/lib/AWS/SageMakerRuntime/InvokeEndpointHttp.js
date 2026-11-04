import * as sagemaker from "@distilled.cloud/aws/sagemaker-runtime";
import * as Layer from "effect/Layer";
import { makeEndpointInvocationHttpBinding } from "./BindingHttp.js";
import { InvokeEndpoint } from "./InvokeEndpoint.js";
export const InvokeEndpointHttp = Layer.effect(InvokeEndpoint, makeEndpointInvocationHttpBinding({
    tag: "AWS.SageMakerRuntime.InvokeEndpoint",
    operation: sagemaker.invokeEndpoint,
    actions: ["sagemaker:InvokeEndpoint"],
}));
//# sourceMappingURL=InvokeEndpointHttp.js.map