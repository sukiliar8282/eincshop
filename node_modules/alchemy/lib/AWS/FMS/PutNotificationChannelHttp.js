import * as fms from "@distilled.cloud/aws/fms";
import * as Layer from "effect/Layer";
import { makeFmsHttpBinding } from "./BindingHttp.js";
import { PutNotificationChannel } from "./PutNotificationChannel.js";
export const PutNotificationChannelHttp = Layer.effect(PutNotificationChannel, makeFmsHttpBinding({
    capability: "PutNotificationChannel",
    iamActions: ["fms:PutNotificationChannel"],
    operation: fms.putNotificationChannel,
}));
//# sourceMappingURL=PutNotificationChannelHttp.js.map