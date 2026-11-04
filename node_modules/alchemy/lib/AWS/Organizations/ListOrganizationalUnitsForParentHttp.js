import * as organizations from "@distilled.cloud/aws/organizations";
import * as Layer from "effect/Layer";
import { makeOrganizationsHttpBinding } from "./BindingHttp.js";
import { ListOrganizationalUnitsForParent } from "./ListOrganizationalUnitsForParent.js";
export const ListOrganizationalUnitsForParentHttp = Layer.effect(ListOrganizationalUnitsForParent, makeOrganizationsHttpBinding({
    capability: "ListOrganizationalUnitsForParent",
    iamActions: ["organizations:ListOrganizationalUnitsForParent"],
    operation: organizations.listOrganizationalUnitsForParent,
}));
//# sourceMappingURL=ListOrganizationalUnitsForParentHttp.js.map