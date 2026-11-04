import * as identitystore from "@distilled.cloud/aws/identitystore";
import * as Layer from "effect/Layer";
import { makeIdentityStoreHttpBinding } from "./BindingHttp.js";
import { UpdateUser } from "./UpdateUser.js";
export const UpdateUserHttp = Layer.effect(UpdateUser, makeIdentityStoreHttpBinding({
    tag: "AWS.IdentityCenter.UpdateUser",
    operation: identitystore.updateUser,
    actions: ["identitystore:UpdateUser"],
}));
//# sourceMappingURL=UpdateUserHttp.js.map