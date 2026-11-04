import * as greengrassv2 from "@distilled.cloud/aws/greengrassv2";
import * as Layer from "effect/Layer";
import { makeGreengrassAccountHttpBinding } from "./BindingHttp.js";
import { GetCoreDevice } from "./GetCoreDevice.js";
export const GetCoreDeviceHttp = Layer.effect(GetCoreDevice, makeGreengrassAccountHttpBinding({
    tag: "AWS.GreengrassV2.GetCoreDevice",
    operation: greengrassv2.getCoreDevice,
    // Core devices are IoT things; Greengrass authorizes the IoT-side lookup
    // with the caller's credentials before resolving the device (observed
    // "not authorized to call Iot Core services for thing" without it).
    actions: ["greengrass:GetCoreDevice", "iot:DescribeThing"],
}));
//# sourceMappingURL=GetCoreDeviceHttp.js.map