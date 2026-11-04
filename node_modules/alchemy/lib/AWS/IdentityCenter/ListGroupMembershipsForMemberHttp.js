import * as identitystore from "@distilled.cloud/aws/identitystore";
import * as Layer from "effect/Layer";
import { makeIdentityStoreHttpBinding } from "./BindingHttp.js";
import { ListGroupMembershipsForMember } from "./ListGroupMembershipsForMember.js";
export const ListGroupMembershipsForMemberHttp = Layer.effect(ListGroupMembershipsForMember, makeIdentityStoreHttpBinding({
    tag: "AWS.IdentityCenter.ListGroupMembershipsForMember",
    operation: identitystore.listGroupMembershipsForMember,
    actions: ["identitystore:ListGroupMembershipsForMember"],
}));
//# sourceMappingURL=ListGroupMembershipsForMemberHttp.js.map