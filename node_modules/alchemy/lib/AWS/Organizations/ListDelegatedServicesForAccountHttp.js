import * as organizations from "@distilled.cloud/aws/organizations";
import * as Layer from "effect/Layer";
import { makeOrganizationsHttpBinding } from "./BindingHttp.js";
import { ListDelegatedServicesForAccount } from "./ListDelegatedServicesForAccount.js";
export const ListDelegatedServicesForAccountHttp = Layer.effect(ListDelegatedServicesForAccount, makeOrganizationsHttpBinding({
    capability: "ListDelegatedServicesForAccount",
    iamActions: ["organizations:ListDelegatedServicesForAccount"],
    operation: organizations.listDelegatedServicesForAccount,
}));
//# sourceMappingURL=ListDelegatedServicesForAccountHttp.js.map