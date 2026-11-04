import * as mm from "@distilled.cloud/aws/mailmanager";
import * as Layer from "effect/Layer";
import { makeArchiveTaskHttpBinding } from "./BindingHttp.js";
import { GetArchiveMessage } from "./GetArchiveMessage.js";
export const GetArchiveMessageHttp = Layer.effect(GetArchiveMessage, makeArchiveTaskHttpBinding({
    tag: "AWS.MailManager.GetArchiveMessage",
    operation: mm.getArchiveMessage,
    actions: ["ses:GetArchiveMessage"],
}));
//# sourceMappingURL=GetArchiveMessageHttp.js.map