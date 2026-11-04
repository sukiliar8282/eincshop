import * as identitystore from "@distilled.cloud/aws/identitystore";
import * as Layer from "effect/Layer";
import { makeIdentityStoreHttpBinding } from "./BindingHttp.js";
import { ListGroups } from "./ListGroups.js";
export const ListGroupsHttp = Layer.effect(ListGroups, makeIdentityStoreHttpBinding({
    tag: "AWS.IdentityCenter.ListGroups",
    operation: identitystore.listGroups,
    actions: ["identitystore:ListGroups"],
}));
//# sourceMappingURL=ListGroupsHttp.js.map