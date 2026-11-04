import * as datazone from "@distilled.cloud/aws/datazone";
import * as Layer from "effect/Layer";
import { makeDataZoneDomainHttpBinding } from "./BindingHttp.js";
import { RejectSubscriptionRequest } from "./RejectSubscriptionRequest.js";
export const RejectSubscriptionRequestHttp = Layer.effect(RejectSubscriptionRequest, makeDataZoneDomainHttpBinding({
    tag: "AWS.DataZone.RejectSubscriptionRequest",
    operation: datazone.rejectSubscriptionRequest,
    actions: ["datazone:RejectSubscriptionRequest"],
}));
//# sourceMappingURL=RejectSubscriptionRequestHttp.js.map