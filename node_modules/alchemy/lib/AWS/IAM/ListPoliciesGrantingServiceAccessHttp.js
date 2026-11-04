import * as iam from "@distilled.cloud/aws/iam";
import * as Layer from "effect/Layer";
import { makeIamHttpBinding } from "./BindingHttp.js";
import { ListPoliciesGrantingServiceAccess } from "./ListPoliciesGrantingServiceAccess.js";
export const ListPoliciesGrantingServiceAccessHttp = Layer.effect(ListPoliciesGrantingServiceAccess, makeIamHttpBinding({
    capability: "ListPoliciesGrantingServiceAccess",
    iamActions: ["iam:ListPoliciesGrantingServiceAccess"],
    operation: iam.listPoliciesGrantingServiceAccess,
}));
//# sourceMappingURL=ListPoliciesGrantingServiceAccessHttp.js.map