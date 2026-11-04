import * as identitystore from "@distilled.cloud/aws/identitystore";
import * as Layer from "effect/Layer";
import { makeIdentityStoreHttpBinding } from "./BindingHttp.js";
import { GetGroupMembershipId } from "./GetGroupMembershipId.js";
export const GetGroupMembershipIdHttp = Layer.effect(GetGroupMembershipId, makeIdentityStoreHttpBinding({
    tag: "AWS.IdentityCenter.GetGroupMembershipId",
    operation: identitystore.getGroupMembershipId,
    actions: ["identitystore:GetGroupMembershipId"],
}));
//# sourceMappingURL=GetGroupMembershipIdHttp.js.map