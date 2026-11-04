import * as appregistry from "@distilled.cloud/aws/service-catalog-appregistry";
import * as Layer from "effect/Layer";
import { makeAttributeGroupScopedHttpBinding } from "./BindingHttp.js";
import { GetAttributeGroup } from "./GetAttributeGroup.js";
export const GetAttributeGroupHttp = Layer.effect(GetAttributeGroup, makeAttributeGroupScopedHttpBinding({
    tag: "AWS.AppRegistry.GetAttributeGroup",
    operation: appregistry.getAttributeGroup,
    actions: ["servicecatalog:GetAttributeGroup"],
}));
//# sourceMappingURL=GetAttributeGroupHttp.js.map