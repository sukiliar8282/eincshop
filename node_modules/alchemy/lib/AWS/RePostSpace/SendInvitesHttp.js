import * as repostspace from "@distilled.cloud/aws/repostspace";
import * as Layer from "effect/Layer";
import { makeRePostSpaceHttpBinding } from "./BindingHttp.js";
import { SendInvites } from "./SendInvites.js";
export const SendInvitesHttp = Layer.effect(SendInvites, makeRePostSpaceHttpBinding({
    tag: "AWS.RePostSpace.SendInvites",
    operation: repostspace.sendInvites,
    actions: ["repostspace:SendInvites"],
}));
//# sourceMappingURL=SendInvitesHttp.js.map