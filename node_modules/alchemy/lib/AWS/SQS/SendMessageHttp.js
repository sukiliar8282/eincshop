import * as sqs from "@distilled.cloud/aws/sqs";
import * as Layer from "effect/Layer";
import { makeQueueUrlHttpBinding } from "./BindingHttp.js";
import { SendMessage } from "./SendMessage.js";
export const SendMessageHttp = Layer.effect(SendMessage, makeQueueUrlHttpBinding({
    tag: "AWS.SQS.SendMessage",
    operation: sqs.sendMessage,
    actions: ["sqs:SendMessage"],
}));
//# sourceMappingURL=SendMessageHttp.js.map