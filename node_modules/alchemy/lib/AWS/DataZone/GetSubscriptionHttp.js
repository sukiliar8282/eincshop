import * as datazone from "@distilled.cloud/aws/datazone";
import * as Layer from "effect/Layer";
import { makeDataZoneDomainHttpBinding } from "./BindingHttp.js";
import { GetSubscription } from "./GetSubscription.js";
export const GetSubscriptionHttp = Layer.effect(GetSubscription, makeDataZoneDomainHttpBinding({
    tag: "AWS.DataZone.GetSubscription",
    operation: datazone.getSubscription,
    actions: ["datazone:GetSubscription"],
}));
//# sourceMappingURL=GetSubscriptionHttp.js.map