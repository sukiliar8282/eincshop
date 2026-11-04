import * as datazone from "@distilled.cloud/aws/datazone";
import * as Layer from "effect/Layer";
import { makeDataZoneDomainHttpBinding } from "./BindingHttp.js";
import { RevokeSubscription } from "./RevokeSubscription.js";
export const RevokeSubscriptionHttp = Layer.effect(RevokeSubscription, makeDataZoneDomainHttpBinding({
    tag: "AWS.DataZone.RevokeSubscription",
    operation: datazone.revokeSubscription,
    actions: ["datazone:RevokeSubscription"],
}));
//# sourceMappingURL=RevokeSubscriptionHttp.js.map