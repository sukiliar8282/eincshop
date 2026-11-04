import * as cloudformation from "@distilled.cloud/aws/cloudformation";
import * as Layer from "effect/Layer";
import { makeCloudFormationStackHttpBinding } from "./BindingHttp.js";
import { SignalResource } from "./SignalResource.js";
export const SignalResourceHttp = Layer.effect(SignalResource, makeCloudFormationStackHttpBinding({
    tag: "AWS.CloudFormation.SignalResource",
    operation: cloudformation.signalResource,
    actions: ["cloudformation:SignalResource"],
}));
//# sourceMappingURL=SignalResourceHttp.js.map