import * as organizations from "@distilled.cloud/aws/organizations";
import * as Layer from "effect/Layer";
import { makeOrganizationsHttpBinding } from "./BindingHttp.js";
import { ListAccounts } from "./ListAccounts.js";
export const ListAccountsHttp = Layer.effect(ListAccounts, makeOrganizationsHttpBinding({
    capability: "ListAccounts",
    iamActions: ["organizations:ListAccounts"],
    operation: organizations.listAccounts,
}));
//# sourceMappingURL=ListAccountsHttp.js.map