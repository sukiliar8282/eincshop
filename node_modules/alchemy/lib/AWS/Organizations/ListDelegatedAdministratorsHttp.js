import * as organizations from "@distilled.cloud/aws/organizations";
import * as Layer from "effect/Layer";
import { makeOrganizationsHttpBinding } from "./BindingHttp.js";
import { ListDelegatedAdministrators } from "./ListDelegatedAdministrators.js";
export const ListDelegatedAdministratorsHttp = Layer.effect(ListDelegatedAdministrators, makeOrganizationsHttpBinding({
    capability: "ListDelegatedAdministrators",
    iamActions: ["organizations:ListDelegatedAdministrators"],
    operation: organizations.listDelegatedAdministrators,
}));
//# sourceMappingURL=ListDelegatedAdministratorsHttp.js.map