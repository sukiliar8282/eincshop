import * as fms from "@distilled.cloud/aws/fms";
import * as Layer from "effect/Layer";
import { makeFmsHttpBinding } from "./BindingHttp.js";
import { ListPolicies } from "./ListPolicies.js";
export const ListPoliciesHttp = Layer.effect(ListPolicies, makeFmsHttpBinding({
    capability: "ListPolicies",
    iamActions: ["fms:ListPolicies"],
    operation: fms.listPolicies,
}));
//# sourceMappingURL=ListPoliciesHttp.js.map