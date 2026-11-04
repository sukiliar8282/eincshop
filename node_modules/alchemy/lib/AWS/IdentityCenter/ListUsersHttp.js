import * as identitystore from "@distilled.cloud/aws/identitystore";
import * as Layer from "effect/Layer";
import { makeIdentityStoreHttpBinding } from "./BindingHttp.js";
import { ListUsers } from "./ListUsers.js";
export const ListUsersHttp = Layer.effect(ListUsers, makeIdentityStoreHttpBinding({
    tag: "AWS.IdentityCenter.ListUsers",
    operation: identitystore.listUsers,
    actions: ["identitystore:ListUsers"],
}));
//# sourceMappingURL=ListUsersHttp.js.map