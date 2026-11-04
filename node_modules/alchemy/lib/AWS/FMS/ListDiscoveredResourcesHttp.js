import * as fms from "@distilled.cloud/aws/fms";
import * as Layer from "effect/Layer";
import { makeFmsHttpBinding } from "./BindingHttp.js";
import { ListDiscoveredResources } from "./ListDiscoveredResources.js";
export const ListDiscoveredResourcesHttp = Layer.effect(ListDiscoveredResources, makeFmsHttpBinding({
    capability: "ListDiscoveredResources",
    iamActions: ["fms:ListDiscoveredResources"],
    operation: fms.listDiscoveredResources,
}));
//# sourceMappingURL=ListDiscoveredResourcesHttp.js.map