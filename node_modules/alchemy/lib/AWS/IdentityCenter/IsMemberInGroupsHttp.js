import * as identitystore from "@distilled.cloud/aws/identitystore";
import * as Layer from "effect/Layer";
import { makeIdentityStoreHttpBinding } from "./BindingHttp.js";
import { IsMemberInGroups } from "./IsMemberInGroups.js";
export const IsMemberInGroupsHttp = Layer.effect(IsMemberInGroups, makeIdentityStoreHttpBinding({
    tag: "AWS.IdentityCenter.IsMemberInGroups",
    operation: identitystore.isMemberInGroups,
    actions: ["identitystore:IsMemberInGroups"],
}));
//# sourceMappingURL=IsMemberInGroupsHttp.js.map