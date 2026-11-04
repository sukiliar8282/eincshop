import * as fms from "@distilled.cloud/aws/fms";
import * as Layer from "effect/Layer";
import { makeFmsHttpBinding } from "./BindingHttp.js";
import { GetNotificationChannel } from "./GetNotificationChannel.js";
export const GetNotificationChannelHttp = Layer.effect(GetNotificationChannel, makeFmsHttpBinding({
    capability: "GetNotificationChannel",
    iamActions: ["fms:GetNotificationChannel"],
    operation: fms.getNotificationChannel,
}));
//# sourceMappingURL=GetNotificationChannelHttp.js.map