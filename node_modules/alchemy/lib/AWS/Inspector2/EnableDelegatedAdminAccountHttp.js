import * as inspector2 from "@distilled.cloud/aws/inspector2";
import * as Layer from "effect/Layer";
import { makeInspector2AccountHttpBinding } from "./BindingHttp.js";
import { EnableDelegatedAdminAccount } from "./EnableDelegatedAdminAccount.js";
export const EnableDelegatedAdminAccountHttp = Layer.effect(EnableDelegatedAdminAccount, makeInspector2AccountHttpBinding({
    tag: "AWS.Inspector2.EnableDelegatedAdminAccount",
    operation: inspector2.enableDelegatedAdminAccount,
    actions: ["inspector2:EnableDelegatedAdminAccount"],
}));
//# sourceMappingURL=EnableDelegatedAdminAccountHttp.js.map