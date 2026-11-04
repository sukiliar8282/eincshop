import * as config from "@distilled.cloud/aws/config-service";
import * as Layer from "effect/Layer";
import { makeConfigAccountHttpBinding } from "./BindingHttp.js";
import { ListDiscoveredResources } from "./ListDiscoveredResources.js";
export const ListDiscoveredResourcesHttp = Layer.effect(ListDiscoveredResources, makeConfigAccountHttpBinding({
    tag: "AWS.Config.ListDiscoveredResources",
    operation: config.listDiscoveredResources,
    actions: ["config:ListDiscoveredResources"],
}));
//# sourceMappingURL=ListDiscoveredResourcesHttp.js.map