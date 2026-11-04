import * as iotfleetwise from "@distilled.cloud/aws/iotfleetwise";
import * as Layer from "effect/Layer";
import { makeFleetWiseResourceHttpBinding } from "./BindingHttp.js";
import { GetVehicleStatus } from "./GetVehicleStatus.js";
export const GetVehicleStatusHttp = Layer.effect(GetVehicleStatus, makeFleetWiseResourceHttpBinding({
    tag: "AWS.IoTFleetWise.GetVehicleStatus",
    operation: iotfleetwise.getVehicleStatus,
    actions: ["iotfleetwise:GetVehicleStatus"],
    requestKey: "vehicleName",
    identifier: (vehicle) => vehicle.vehicleName,
    // GetVehicleStatus authorizes on both the vehicle and its associated
    // campaigns — the campaign ARNs are unknowable at deploy time.
    resources: (vehicle) => [
        vehicle.vehicleArn,
        "arn:aws:iotfleetwise:*:*:campaign/*",
    ],
}));
//# sourceMappingURL=GetVehicleStatusHttp.js.map