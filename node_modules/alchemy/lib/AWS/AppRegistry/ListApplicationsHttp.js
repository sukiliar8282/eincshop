import * as appregistry from "@distilled.cloud/aws/service-catalog-appregistry";
import * as Layer from "effect/Layer";
import { makeAppRegistryAccountHttpBinding } from "./BindingHttp.js";
import { ListApplications } from "./ListApplications.js";
export const ListApplicationsHttp = Layer.effect(ListApplications, makeAppRegistryAccountHttpBinding({
    tag: "AWS.AppRegistry.ListApplications",
    operation: appregistry.listApplications,
    actions: ["servicecatalog:ListApplications"],
}));
//# sourceMappingURL=ListApplicationsHttp.js.map