import * as sqs from "@distilled.cloud/aws/sqs";
import * as Layer from "effect/Layer";
import { makeQueueUrlHttpBinding } from "./BindingHttp.js";
import { SendMessageBatch } from "./SendMessageBatch.js";
export const SendMessageBatchHttp = Layer.effect(SendMessageBatch, makeQueueUrlHttpBinding({
    tag: "AWS.SQS.SendMessageBatch",
    operation: sqs.sendMessageBatch,
    // Batch entries are authorized by the singular action.
    actions: ["sqs:SendMessage"],
}));
//# sourceMappingURL=SendMessageBatchHttp.js.map