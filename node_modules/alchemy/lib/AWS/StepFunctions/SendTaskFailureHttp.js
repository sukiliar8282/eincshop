import * as sfn from "@distilled.cloud/aws/sfn";
import * as Layer from "effect/Layer";
import { makeTaskCallbackHttpBinding } from "./BindingHttp.js";
import { SendTaskFailure } from "./SendTaskFailure.js";
export const SendTaskFailureHttp = Layer.effect(SendTaskFailure, makeTaskCallbackHttpBinding({
    tag: "AWS.StepFunctions.SendTaskFailure",
    operation: sfn.sendTaskFailure,
    actions: ["states:SendTaskFailure"],
}));
//# sourceMappingURL=SendTaskFailureHttp.js.map