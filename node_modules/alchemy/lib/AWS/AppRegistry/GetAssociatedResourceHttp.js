import * as appregistry from "@distilled.cloud/aws/service-catalog-appregistry";
import * as Layer from "effect/Layer";
import { makeApplicationScopedHttpBinding } from "./BindingHttp.js";
import { GetAssociatedResource } from "./GetAssociatedResource.js";
export const GetAssociatedResourceHttp = Layer.effect(GetAssociatedResource, makeApplicationScopedHttpBinding({
    tag: "AWS.AppRegistry.GetAssociatedResource",
    operation: appregistry.getAssociatedResource,
    actions: ["servicecatalog:GetAssociatedResource"],
}));
//# sourceMappingURL=GetAssociatedResourceHttp.js.map