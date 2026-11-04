import * as organizations from "@distilled.cloud/aws/organizations";
import * as Layer from "effect/Layer";
import { makeOrganizationsHttpBinding } from "./BindingHttp.js";
import { InviteAccountToOrganization } from "./InviteAccountToOrganization.js";
export const InviteAccountToOrganizationHttp = Layer.effect(InviteAccountToOrganization, makeOrganizationsHttpBinding({
    capability: "InviteAccountToOrganization",
    iamActions: ["organizations:InviteAccountToOrganization"],
    operation: organizations.inviteAccountToOrganization,
}));
//# sourceMappingURL=InviteAccountToOrganizationHttp.js.map