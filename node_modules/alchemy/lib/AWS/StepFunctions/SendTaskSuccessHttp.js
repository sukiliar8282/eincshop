import * as sfn from "@distilled.cloud/aws/sfn";
import * as Layer from "effect/Layer";
import { makeTaskCallbackHttpBinding } from "./BindingHttp.js";
import { SendTaskSuccess } from "./SendTaskSuccess.js";
export const SendTaskSuccessHttp = Layer.effect(SendTaskSuccess, makeTaskCallbackHttpBinding({
    tag: "AWS.StepFunctions.SendTaskSuccess",
    operation: sfn.sendTaskSuccess,
    actions: ["states:SendTaskSuccess"],
}));
//# sourceMappingURL=SendTaskSuccessHttp.js.map