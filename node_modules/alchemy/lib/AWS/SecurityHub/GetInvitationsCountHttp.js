import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Layer from "effect/Layer";
import { makeSecurityHubHttpBinding } from "./BindingHttp.js";
import { GetInvitationsCount } from "./GetInvitationsCount.js";
export const GetInvitationsCountHttp = Layer.effect(GetInvitationsCount, makeSecurityHubHttpBinding({
    tag: "AWS.SecurityHub.GetInvitationsCount",
    operation: securityhub.getInvitationsCount,
    actions: ["securityhub:GetInvitationsCount"],
}));
//# sourceMappingURL=GetInvitationsCountHttp.js.map