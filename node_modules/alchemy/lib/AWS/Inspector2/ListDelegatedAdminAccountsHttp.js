import * as inspector2 from "@distilled.cloud/aws/inspector2";
import * as Layer from "effect/Layer";
import { makeInspector2AccountHttpBinding } from "./BindingHttp.js";
import { ListDelegatedAdminAccounts } from "./ListDelegatedAdminAccounts.js";
export const ListDelegatedAdminAccountsHttp = Layer.effect(ListDelegatedAdminAccounts, makeInspector2AccountHttpBinding({
    tag: "AWS.Inspector2.ListDelegatedAdminAccounts",
    operation: inspector2.listDelegatedAdminAccounts,
    actions: ["inspector2:ListDelegatedAdminAccounts"],
}));
//# sourceMappingURL=ListDelegatedAdminAccountsHttp.js.map