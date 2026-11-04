import * as organizations from "@distilled.cloud/aws/organizations";
import * as Layer from "effect/Layer";
import { makeOrganizationsHttpBinding } from "./BindingHttp.js";
import { ListPolicies } from "./ListPolicies.js";
export const ListPoliciesHttp = Layer.effect(ListPolicies, makeOrganizationsHttpBinding({
    capability: "ListPolicies",
    iamActions: ["organizations:ListPolicies"],
    operation: organizations.listPolicies,
}));
//# sourceMappingURL=ListPoliciesHttp.js.map