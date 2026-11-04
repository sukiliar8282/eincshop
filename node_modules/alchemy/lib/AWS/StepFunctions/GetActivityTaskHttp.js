import * as sfn from "@distilled.cloud/aws/sfn";
import * as Layer from "effect/Layer";
import { makeActivityArnHttpBinding } from "./BindingHttp.js";
import { GetActivityTask } from "./GetActivityTask.js";
export const GetActivityTaskHttp = Layer.effect(GetActivityTask, makeActivityArnHttpBinding({
    tag: "AWS.StepFunctions.GetActivityTask",
    operation: sfn.getActivityTask,
    actions: ["states:GetActivityTask"],
}));
//# sourceMappingURL=GetActivityTaskHttp.js.map