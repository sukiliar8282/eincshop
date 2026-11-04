import * as iotw from "@distilled.cloud/aws/iot-wireless";
import * as Layer from "effect/Layer";
import { makeIotWirelessDeviceHttpBinding } from "./BindingHttp.js";
import { ListQueuedMessages, } from "./ListQueuedMessages.js";
export const ListQueuedMessagesHttp = Layer.effect(ListQueuedMessages, makeIotWirelessDeviceHttpBinding({
    capability: "ListQueuedMessages",
    iamActions: ["iotwireless:ListQueuedMessages"],
    operation: iotw.listQueuedMessages,
    prepare: (request, wirelessDeviceId) => ({
        ...request,
        Id: wirelessDeviceId,
    }),
}));
//# sourceMappingURL=ListQueuedMessagesHttp.js.map