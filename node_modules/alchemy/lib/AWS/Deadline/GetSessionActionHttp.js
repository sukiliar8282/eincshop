import * as deadline from "@distilled.cloud/aws/deadline";
import * as Layer from "effect/Layer";
import { makeDeadlineQueueHttpBinding } from "./BindingHttp.js";
import { GetSessionAction } from "./GetSessionAction.js";
export const GetSessionActionHttp = Layer.effect(GetSessionAction, makeDeadlineQueueHttpBinding({
    tag: "AWS.Deadline.GetSessionAction",
    operation: deadline.getSessionAction,
    actions: ["deadline:GetSessionAction"],
}));
//# sourceMappingURL=GetSessionActionHttp.js.map