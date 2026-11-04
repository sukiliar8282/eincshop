import * as organizations from "@distilled.cloud/aws/organizations";
import * as Layer from "effect/Layer";
import { makeOrganizationsHttpBinding } from "./BindingHttp.js";
import { ListAccountsWithInvalidEffectivePolicy } from "./ListAccountsWithInvalidEffectivePolicy.js";
export const ListAccountsWithInvalidEffectivePolicyHttp = Layer.effect(ListAccountsWithInvalidEffectivePolicy, makeOrganizationsHttpBinding({
    capability: "ListAccountsWithInvalidEffectivePolicy",
    iamActions: ["organizations:ListAccountsWithInvalidEffectivePolicy"],
    operation: organizations.listAccountsWithInvalidEffectivePolicy,
}));
//# sourceMappingURL=ListAccountsWithInvalidEffectivePolicyHttp.js.map