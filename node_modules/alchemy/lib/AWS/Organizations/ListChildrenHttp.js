import * as organizations from "@distilled.cloud/aws/organizations";
import * as Layer from "effect/Layer";
import { makeOrganizationsHttpBinding } from "./BindingHttp.js";
import { ListChildren } from "./ListChildren.js";
export const ListChildrenHttp = Layer.effect(ListChildren, makeOrganizationsHttpBinding({
    capability: "ListChildren",
    iamActions: ["organizations:ListChildren"],
    operation: organizations.listChildren,
}));
//# sourceMappingURL=ListChildrenHttp.js.map