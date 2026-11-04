import * as organizations from "@distilled.cloud/aws/organizations";
import * as Layer from "effect/Layer";
import { makeOrganizationsHttpBinding } from "./BindingHttp.js";
import { ListEffectivePolicyValidationErrors } from "./ListEffectivePolicyValidationErrors.js";
export const ListEffectivePolicyValidationErrorsHttp = Layer.effect(ListEffectivePolicyValidationErrors, makeOrganizationsHttpBinding({
    capability: "ListEffectivePolicyValidationErrors",
    iamActions: ["organizations:ListEffectivePolicyValidationErrors"],
    operation: organizations.listEffectivePolicyValidationErrors,
}));
//# sourceMappingURL=ListEffectivePolicyValidationErrorsHttp.js.map