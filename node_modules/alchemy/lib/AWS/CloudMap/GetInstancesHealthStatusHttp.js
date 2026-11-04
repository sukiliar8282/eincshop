import * as SD from "@distilled.cloud/aws/servicediscovery";
import * as Layer from "effect/Layer";
import { makeCloudMapServiceHttpBinding } from "./BindingHttp.js";
import { GetInstancesHealthStatus } from "./GetInstancesHealthStatus.js";
export const GetInstancesHealthStatusHttp = Layer.effect(GetInstancesHealthStatus, makeCloudMapServiceHttpBinding({
    tag: "AWS.CloudMap.GetInstancesHealthStatus",
    operation: SD.getInstancesHealthStatus,
    actions: ["servicediscovery:GetInstancesHealthStatus"],
}));
//# sourceMappingURL=GetInstancesHealthStatusHttp.js.map