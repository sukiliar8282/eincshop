import * as iotfleetwise from "@distilled.cloud/aws/iotfleetwise";
import * as Layer from "effect/Layer";
import { makeFleetWiseResourceHttpBinding } from "./BindingHttp.js";
import { ListFleetsForVehicle } from "./ListFleetsForVehicle.js";
export const ListFleetsForVehicleHttp = Layer.effect(ListFleetsForVehicle, makeFleetWiseResourceHttpBinding({
    tag: "AWS.IoTFleetWise.ListFleetsForVehicle",
    operation: iotfleetwise.listFleetsForVehicle,
    actions: ["iotfleetwise:ListFleetsForVehicle"],
    requestKey: "vehicleName",
    identifier: (vehicle) => vehicle.vehicleName,
    resources: (vehicle) => [vehicle.vehicleArn],
}));
//# sourceMappingURL=ListFleetsForVehicleHttp.js.map