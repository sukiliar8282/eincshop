import * as iotdata from "@distilled.cloud/aws/iot-data-plane";
import * as Layer from "effect/Layer";
import { makeIotClientHttpBinding } from "./BindingHttp.js";
import { SendDirectMessage } from "./SendDirectMessage.js";
/**
 * HTTP implementation of the {@link SendDirectMessage} capability — grants
 * `iot:SendDirectMessage` on the bound client filter and calls the IoT
 * data-plane `SendDirectMessage` API.
 */
export const SendDirectMessageHttp = Layer.effect(SendDirectMessage, makeIotClientHttpBinding({
    tag: "AWS.IoT.SendDirectMessage",
    operation: iotdata.sendDirectMessage,
    actions: ["iot:SendDirectMessage"],
}));
//# sourceMappingURL=SendDirectMessageHttp.js.map