import * as notifications from "@distilled.cloud/aws/notifications";
import * as Layer from "effect/Layer";
import { makeNotificationConfigurationHttpBinding } from "./BindingHttp.js";
import { ListChannels } from "./ListChannels.js";
export const ListChannelsHttp = Layer.effect(ListChannels, makeNotificationConfigurationHttpBinding({
    capability: "ListChannels",
    iamActions: ["notifications:ListChannels"],
    operation: notifications.listChannels,
}));
//# sourceMappingURL=ListChannelsHttp.js.map