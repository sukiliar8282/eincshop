import * as ivschat from "@distilled.cloud/aws/ivschat";
import * as Layer from "effect/Layer";
import { makeIvsChatRoomHttpBinding } from "./BindingHttp.js";
import { SendEvent } from "./SendEvent.js";
export const SendEventHttp = Layer.effect(SendEvent, makeIvsChatRoomHttpBinding({
    tag: "AWS.IVSChat.SendEvent",
    operation: ivschat.sendEvent,
    actions: ["ivschat:SendEvent"],
}));
//# sourceMappingURL=SendEventHttp.js.map