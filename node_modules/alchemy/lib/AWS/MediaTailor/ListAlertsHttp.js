import * as mediatailor from "@distilled.cloud/aws/mediatailor";
import * as Layer from "effect/Layer";
import { makeMediaTailorHttpBinding } from "./BindingHttp.js";
import { ListAlerts } from "./ListAlerts.js";
export const ListAlertsHttp = Layer.effect(ListAlerts, makeMediaTailorHttpBinding({
    capability: "ListAlerts",
    iamActions: ["mediatailor:ListAlerts"],
    operation: mediatailor.listAlerts,
}));
//# sourceMappingURL=ListAlertsHttp.js.map