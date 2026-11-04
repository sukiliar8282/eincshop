import * as greengrassv2 from "@distilled.cloud/aws/greengrassv2";
import * as Layer from "effect/Layer";
import { makeGreengrassAccountHttpBinding } from "./BindingHttp.js";
import { ListCoreDevices } from "./ListCoreDevices.js";
export const ListCoreDevicesHttp = Layer.effect(ListCoreDevices, makeGreengrassAccountHttpBinding({
    tag: "AWS.GreengrassV2.ListCoreDevices",
    operation: greengrassv2.listCoreDevices,
    actions: ["greengrass:ListCoreDevices"],
}));
//# sourceMappingURL=ListCoreDevicesHttp.js.map