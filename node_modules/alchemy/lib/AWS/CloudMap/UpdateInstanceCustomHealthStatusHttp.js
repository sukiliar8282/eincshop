import * as SD from "@distilled.cloud/aws/servicediscovery";
import * as Layer from "effect/Layer";
import { makeCloudMapServiceHttpBinding } from "./BindingHttp.js";
import { UpdateInstanceCustomHealthStatus } from "./UpdateInstanceCustomHealthStatus.js";
export const UpdateInstanceCustomHealthStatusHttp = Layer.effect(UpdateInstanceCustomHealthStatus, makeCloudMapServiceHttpBinding({
    tag: "AWS.CloudMap.UpdateInstanceCustomHealthStatus",
    operation: SD.updateInstanceCustomHealthStatus,
    actions: ["servicediscovery:UpdateInstanceCustomHealthStatus"],
}));
//# sourceMappingURL=UpdateInstanceCustomHealthStatusHttp.js.map