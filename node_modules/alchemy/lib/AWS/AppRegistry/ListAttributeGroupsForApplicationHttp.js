import * as appregistry from "@distilled.cloud/aws/service-catalog-appregistry";
import * as Layer from "effect/Layer";
import { makeApplicationScopedHttpBinding } from "./BindingHttp.js";
import { ListAttributeGroupsForApplication } from "./ListAttributeGroupsForApplication.js";
export const ListAttributeGroupsForApplicationHttp = Layer.effect(ListAttributeGroupsForApplication, makeApplicationScopedHttpBinding({
    tag: "AWS.AppRegistry.ListAttributeGroupsForApplication",
    operation: appregistry.listAttributeGroupsForApplication,
    actions: ["servicecatalog:ListAttributeGroupsForApplication"],
}));
//# sourceMappingURL=ListAttributeGroupsForApplicationHttp.js.map