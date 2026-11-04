import * as iotfleetwise from "@distilled.cloud/aws/iotfleetwise";
import * as Layer from "effect/Layer";
import { makeFleetWiseResourceHttpBinding } from "./BindingHttp.js";
import { DisassociateVehicleFleet } from "./DisassociateVehicleFleet.js";
export const DisassociateVehicleFleetHttp = Layer.effect(DisassociateVehicleFleet, makeFleetWiseResourceHttpBinding({
    tag: "AWS.IoTFleetWise.DisassociateVehicleFleet",
    operation: iotfleetwise.disassociateVehicleFleet,
    actions: ["iotfleetwise:DisassociateVehicleFleet"],
    requestKey: "fleetId",
    identifier: (fleet) => fleet.fleetId,
    resources: (fleet) => [
        fleet.fleetArn,
        "arn:aws:iotfleetwise:*:*:vehicle/*",
    ],
}));
//# sourceMappingURL=DisassociateVehicleFleetHttp.js.map