import * as route53 from "@distilled.cloud/aws/route-53";
import * as Layer from "effect/Layer";
import { makeRoute53HealthCheckHttpBinding } from "./BindingHttp.js";
import { GetHealthCheckStatus } from "./GetHealthCheckStatus.js";
export const GetHealthCheckStatusHttp = Layer.effect(GetHealthCheckStatus, makeRoute53HealthCheckHttpBinding({
    tag: "AWS.Route53.GetHealthCheckStatus",
    operation: route53.getHealthCheckStatus,
    actions: ["route53:GetHealthCheckStatus"],
}));
//# sourceMappingURL=GetHealthCheckStatusHttp.js.map