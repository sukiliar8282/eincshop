import * as deadline from "@distilled.cloud/aws/deadline";
import * as Layer from "effect/Layer";
import { makeDeadlineQueueHttpBinding } from "./BindingHttp.js";
import { ListSessions } from "./ListSessions.js";
export const ListSessionsHttp = Layer.effect(ListSessions, makeDeadlineQueueHttpBinding({
    tag: "AWS.Deadline.ListSessions",
    operation: deadline.listSessions,
    actions: ["deadline:ListSessions"],
}));
//# sourceMappingURL=ListSessionsHttp.js.map