import * as dataexchange from "@distilled.cloud/aws/dataexchange";
import * as Layer from "effect/Layer";
import { makeDataSetHttpBinding } from "./BindingHttp.js";
import { SendDataSetNotification } from "./SendDataSetNotification.js";
export const SendDataSetNotificationHttp = Layer.effect(SendDataSetNotification, makeDataSetHttpBinding({
    tag: "AWS.DataExchange.SendDataSetNotification",
    operation: dataexchange.sendDataSetNotification,
    actions: ["dataexchange:SendDataSetNotification"],
}));
//# sourceMappingURL=SendDataSetNotificationHttp.js.map