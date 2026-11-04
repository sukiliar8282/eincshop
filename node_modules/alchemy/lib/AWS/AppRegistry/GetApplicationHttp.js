import * as appregistry from "@distilled.cloud/aws/service-catalog-appregistry";
import * as Layer from "effect/Layer";
import { makeApplicationScopedHttpBinding } from "./BindingHttp.js";
import { GetApplication } from "./GetApplication.js";
export const GetApplicationHttp = Layer.effect(GetApplication, makeApplicationScopedHttpBinding({
    tag: "AWS.AppRegistry.GetApplication",
    operation: appregistry.getApplication,
    actions: ["servicecatalog:GetApplication"],
}));
//# sourceMappingURL=GetApplicationHttp.js.map