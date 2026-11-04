import * as deadline from "@distilled.cloud/aws/deadline";
import * as Layer from "effect/Layer";
import { makeDeadlineQueueHttpBinding } from "./BindingHttp.js";
import { GetSession } from "./GetSession.js";
export const GetSessionHttp = Layer.effect(GetSession, makeDeadlineQueueHttpBinding({
    tag: "AWS.Deadline.GetSession",
    operation: deadline.getSession,
    actions: ["deadline:GetSession"],
}));
//# sourceMappingURL=GetSessionHttp.js.map