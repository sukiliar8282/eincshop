import * as organizations from "@distilled.cloud/aws/organizations";
import * as Layer from "effect/Layer";
import { makeOrganizationsHttpBinding } from "./BindingHttp.js";
import { ListPoliciesForTarget } from "./ListPoliciesForTarget.js";
export const ListPoliciesForTargetHttp = Layer.effect(ListPoliciesForTarget, makeOrganizationsHttpBinding({
    capability: "ListPoliciesForTarget",
    iamActions: ["organizations:ListPoliciesForTarget"],
    operation: organizations.listPoliciesForTarget,
}));
//# sourceMappingURL=ListPoliciesForTargetHttp.js.map