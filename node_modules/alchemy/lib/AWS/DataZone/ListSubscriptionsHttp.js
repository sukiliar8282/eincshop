import * as datazone from "@distilled.cloud/aws/datazone";
import * as Layer from "effect/Layer";
import { makeDataZoneDomainHttpBinding } from "./BindingHttp.js";
import { ListSubscriptions } from "./ListSubscriptions.js";
export const ListSubscriptionsHttp = Layer.effect(ListSubscriptions, makeDataZoneDomainHttpBinding({
    tag: "AWS.DataZone.ListSubscriptions",
    operation: datazone.listSubscriptions,
    actions: ["datazone:ListSubscriptions"],
}));
//# sourceMappingURL=ListSubscriptionsHttp.js.map