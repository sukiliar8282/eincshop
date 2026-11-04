import * as identitystore from "@distilled.cloud/aws/identitystore";
import * as Layer from "effect/Layer";
import { makeIdentityStoreHttpBinding } from "./BindingHttp.js";
import { DescribeUser } from "./DescribeUser.js";
export const DescribeUserHttp = Layer.effect(DescribeUser, makeIdentityStoreHttpBinding({
    tag: "AWS.IdentityCenter.DescribeUser",
    operation: identitystore.describeUser,
    actions: ["identitystore:DescribeUser"],
}));
//# sourceMappingURL=DescribeUserHttp.js.map