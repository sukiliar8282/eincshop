import * as mm from "@distilled.cloud/aws/mailmanager";
import * as Layer from "effect/Layer";
import { makeArchiveTaskHttpBinding } from "./BindingHttp.js";
import { GetArchiveMessageContent } from "./GetArchiveMessageContent.js";
export const GetArchiveMessageContentHttp = Layer.effect(GetArchiveMessageContent, makeArchiveTaskHttpBinding({
    tag: "AWS.MailManager.GetArchiveMessageContent",
    operation: mm.getArchiveMessageContent,
    actions: ["ses:GetArchiveMessageContent"],
}));
//# sourceMappingURL=GetArchiveMessageContentHttp.js.map