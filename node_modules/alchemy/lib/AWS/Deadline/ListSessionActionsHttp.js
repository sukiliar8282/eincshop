import * as deadline from "@distilled.cloud/aws/deadline";
import * as Layer from "effect/Layer";
import { makeDeadlineQueueHttpBinding } from "./BindingHttp.js";
import { ListSessionActions } from "./ListSessionActions.js";
export const ListSessionActionsHttp = Layer.effect(ListSessionActions, makeDeadlineQueueHttpBinding({
    tag: "AWS.Deadline.ListSessionActions",
    operation: deadline.listSessionActions,
    actions: ["deadline:ListSessionActions"],
}));
//# sourceMappingURL=ListSessionActionsHttp.js.map