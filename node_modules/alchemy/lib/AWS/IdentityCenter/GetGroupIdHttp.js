import * as identitystore from "@distilled.cloud/aws/identitystore";
import * as Layer from "effect/Layer";
import { makeIdentityStoreHttpBinding } from "./BindingHttp.js";
import { GetGroupId } from "./GetGroupId.js";
export const GetGroupIdHttp = Layer.effect(GetGroupId, makeIdentityStoreHttpBinding({
    tag: "AWS.IdentityCenter.GetGroupId",
    operation: identitystore.getGroupId,
    actions: ["identitystore:GetGroupId"],
}));
//# sourceMappingURL=GetGroupIdHttp.js.map