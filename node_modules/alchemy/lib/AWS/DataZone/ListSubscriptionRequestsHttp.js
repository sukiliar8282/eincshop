import * as datazone from "@distilled.cloud/aws/datazone";
import * as Layer from "effect/Layer";
import { makeDataZoneDomainHttpBinding } from "./BindingHttp.js";
import { ListSubscriptionRequests } from "./ListSubscriptionRequests.js";
export const ListSubscriptionRequestsHttp = Layer.effect(ListSubscriptionRequests, makeDataZoneDomainHttpBinding({
    tag: "AWS.DataZone.ListSubscriptionRequests",
    operation: datazone.listSubscriptionRequests,
    actions: ["datazone:ListSubscriptionRequests"],
}));
//# sourceMappingURL=ListSubscriptionRequestsHttp.js.map