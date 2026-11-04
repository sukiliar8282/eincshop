import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { InviteMembers } from "./InviteMembers.js";
export const InviteMembersHttp = Layer.effect(InviteMembers, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.InviteMembers",
    operation: securityhub.inviteMembers,
    actions: ["securityhub:InviteMembers"],
}));
//# sourceMappingURL=InviteMembersHttp.js.map