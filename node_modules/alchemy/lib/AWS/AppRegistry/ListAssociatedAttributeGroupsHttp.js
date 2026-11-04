import * as appregistry from "@distilled.cloud/aws/service-catalog-appregistry";
import * as Layer from "effect/Layer";
import { makeApplicationScopedHttpBinding } from "./BindingHttp.js";
import { ListAssociatedAttributeGroups } from "./ListAssociatedAttributeGroups.js";
export const ListAssociatedAttributeGroupsHttp = Layer.effect(ListAssociatedAttributeGroups, makeApplicationScopedHttpBinding({
    tag: "AWS.AppRegistry.ListAssociatedAttributeGroups",
    operation: appregistry.listAssociatedAttributeGroups,
    actions: ["servicecatalog:ListAssociatedAttributeGroups"],
}));
//# sourceMappingURL=ListAssociatedAttributeGroupsHttp.js.map