import * as elbv2 from "@distilled.cloud/aws/elastic-load-balancing-v2";
import * as Layer from "effect/Layer";
import { makeLoadBalancerHttpBinding } from "./BindingHttp.js";
import { ModifyCapacityReservation } from "./ModifyCapacityReservation.js";
export const ModifyCapacityReservationHttp = Layer.effect(ModifyCapacityReservation, makeLoadBalancerHttpBinding({
    tag: "AWS.ELBv2.ModifyCapacityReservation",
    operation: elbv2.modifyCapacityReservation,
    actions: ["elasticloadbalancing:ModifyCapacityReservation"],
}));
//# sourceMappingURL=ModifyCapacityReservationHttp.js.map