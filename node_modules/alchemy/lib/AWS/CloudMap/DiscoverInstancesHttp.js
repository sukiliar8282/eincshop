import * as SD from "@distilled.cloud/aws/servicediscovery";
import * as Layer from "effect/Layer";
import { makeCloudMapDiscoveryHttpBinding } from "./BindingHttp.js";
import { DiscoverInstances } from "./DiscoverInstances.js";
export const DiscoverInstancesHttp = Layer.effect(DiscoverInstances, makeCloudMapDiscoveryHttpBinding({
    tag: "AWS.CloudMap.DiscoverInstances",
    operation: SD.discoverInstances,
    actions: ["servicediscovery:DiscoverInstances"],
}));
//# sourceMappingURL=DiscoverInstancesHttp.js.map