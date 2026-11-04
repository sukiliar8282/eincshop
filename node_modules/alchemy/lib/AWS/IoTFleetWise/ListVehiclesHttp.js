import * as iotfleetwise from "@distilled.cloud/aws/iotfleetwise";
import * as Layer from "effect/Layer";
import { makeFleetWiseAccountHttpBinding } from "./BindingHttp.js";
import { ListVehicles } from "./ListVehicles.js";
export const ListVehiclesHttp = Layer.effect(ListVehicles, makeFleetWiseAccountHttpBinding({
    tag: "AWS.IoTFleetWise.ListVehicles",
    operation: iotfleetwise.listVehicles,
    actions: ["iotfleetwise:ListVehicles"],
}));
//# sourceMappingURL=ListVehiclesHttp.js.map