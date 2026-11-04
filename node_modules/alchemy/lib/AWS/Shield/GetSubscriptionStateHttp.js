import * as shield from "@distilled.cloud/aws/shield";
import * as Layer from "effect/Layer";
import { makeShieldHttpBinding } from "./BindingHttp.js";
import { GetSubscriptionState } from "./GetSubscriptionState.js";
export const GetSubscriptionStateHttp = Layer.effect(GetSubscriptionState, makeShieldHttpBinding({
    tag: "AWS.Shield.GetSubscriptionState",
    operation: shield.getSubscriptionState,
    actions: ["shield:GetSubscriptionState"],
}));
//# sourceMappingURL=GetSubscriptionStateHttp.js.map