import * as qbusiness from "@distilled.cloud/aws/qbusiness";
import * as Layer from "effect/Layer";
import { makeQBusinessApplicationHttpBinding } from "./BindingHttp.js";
import { ListMessages } from "./ListMessages.js";
export const ListMessagesHttp = Layer.effect(ListMessages, makeQBusinessApplicationHttpBinding({
    tag: "AWS.QBusiness.ListMessages",
    operation: qbusiness.listMessages,
    actions: ["qbusiness:ListMessages"],
}));
//# sourceMappingURL=ListMessagesHttp.js.map