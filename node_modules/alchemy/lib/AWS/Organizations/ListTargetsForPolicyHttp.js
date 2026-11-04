import * as organizations from "@distilled.cloud/aws/organizations";
import * as Layer from "effect/Layer";
import { makeOrganizationsHttpBinding } from "./BindingHttp.js";
import { ListTargetsForPolicy } from "./ListTargetsForPolicy.js";
export const ListTargetsForPolicyHttp = Layer.effect(ListTargetsForPolicy, makeOrganizationsHttpBinding({
    capability: "ListTargetsForPolicy",
    iamActions: ["organizations:ListTargetsForPolicy"],
    operation: organizations.listTargetsForPolicy,
}));
//# sourceMappingURL=ListTargetsForPolicyHttp.js.map