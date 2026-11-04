import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { ListMembers } from "./ListMembers.js";
export const ListMembersHttp = Layer.effect(ListMembers, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.ListMembers",
    operation: securityhub.listMembers,
    actions: ["securityhub:ListMembers"],
}));
//# sourceMappingURL=ListMembersHttp.js.map