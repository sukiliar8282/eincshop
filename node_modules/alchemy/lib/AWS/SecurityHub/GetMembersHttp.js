import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { GetMembers } from "./GetMembers.js";
export const GetMembersHttp = Layer.effect(GetMembers, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.GetMembers",
    operation: securityhub.getMembers,
    actions: ["securityhub:GetMembers"],
}));
//# sourceMappingURL=GetMembersHttp.js.map