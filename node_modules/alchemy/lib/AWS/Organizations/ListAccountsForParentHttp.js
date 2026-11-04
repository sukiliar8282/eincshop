import * as organizations from "@distilled.cloud/aws/organizations";
import * as Layer from "effect/Layer";
import { makeOrganizationsHttpBinding } from "./BindingHttp.js";
import { ListAccountsForParent } from "./ListAccountsForParent.js";
export const ListAccountsForParentHttp = Layer.effect(ListAccountsForParent, makeOrganizationsHttpBinding({
    capability: "ListAccountsForParent",
    iamActions: ["organizations:ListAccountsForParent"],
    operation: organizations.listAccountsForParent,
}));
//# sourceMappingURL=ListAccountsForParentHttp.js.map