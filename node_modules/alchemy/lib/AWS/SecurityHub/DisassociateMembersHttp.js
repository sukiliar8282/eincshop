import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { DisassociateMembers } from "./DisassociateMembers.js";
export const DisassociateMembersHttp = Layer.effect(DisassociateMembers, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.DisassociateMembers",
    operation: securityhub.disassociateMembers,
    actions: ["securityhub:DisassociateMembers"],
}));
//# sourceMappingURL=DisassociateMembersHttp.js.map