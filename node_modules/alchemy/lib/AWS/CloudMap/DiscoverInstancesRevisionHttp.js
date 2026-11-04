import * as SD from "@distilled.cloud/aws/servicediscovery";
import * as Layer from "effect/Layer";
import { makeCloudMapDiscoveryHttpBinding } from "./BindingHttp.js";
import { DiscoverInstancesRevision } from "./DiscoverInstancesRevision.js";
export const DiscoverInstancesRevisionHttp = Layer.effect(DiscoverInstancesRevision, makeCloudMapDiscoveryHttpBinding({
    tag: "AWS.CloudMap.DiscoverInstancesRevision",
    operation: SD.discoverInstancesRevision,
    actions: ["servicediscovery:DiscoverInstancesRevision"],
}));
//# sourceMappingURL=DiscoverInstancesRevisionHttp.js.map