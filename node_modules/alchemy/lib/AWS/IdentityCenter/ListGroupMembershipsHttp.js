import * as identitystore from "@distilled.cloud/aws/identitystore";
import * as Layer from "effect/Layer";
import { makeIdentityStoreHttpBinding } from "./BindingHttp.js";
import { ListGroupMemberships } from "./ListGroupMemberships.js";
export const ListGroupMembershipsHttp = Layer.effect(ListGroupMemberships, makeIdentityStoreHttpBinding({
    tag: "AWS.IdentityCenter.ListGroupMemberships",
    operation: identitystore.listGroupMemberships,
    actions: ["identitystore:ListGroupMemberships"],
}));
//# sourceMappingURL=ListGroupMembershipsHttp.js.map