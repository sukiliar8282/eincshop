import * as iotfleetwise from "@distilled.cloud/aws/iotfleetwise";
import * as Layer from "effect/Layer";
import { makeFleetWiseResourceHttpBinding } from "./BindingHttp.js";
import { ListVehiclesInFleet } from "./ListVehiclesInFleet.js";
export const ListVehiclesInFleetHttp = Layer.effect(ListVehiclesInFleet, makeFleetWiseResourceHttpBinding({
    tag: "AWS.IoTFleetWise.ListVehiclesInFleet",
    operation: iotfleetwise.listVehiclesInFleet,
    actions: ["iotfleetwise:ListVehiclesInFleet"],
    requestKey: "fleetId",
    identifier: (fleet) => fleet.fleetId,
    resources: (fleet) => [fleet.fleetArn],
}));
//# sourceMappingURL=ListVehiclesInFleetHttp.js.map