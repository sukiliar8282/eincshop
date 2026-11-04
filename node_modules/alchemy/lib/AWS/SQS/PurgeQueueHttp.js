import * as sqs from "@distilled.cloud/aws/sqs";
import * as Layer from "effect/Layer";
import { makeQueueUrlHttpBinding } from "./BindingHttp.js";
import { PurgeQueue } from "./PurgeQueue.js";
export const PurgeQueueHttp = Layer.effect(PurgeQueue, makeQueueUrlHttpBinding({
    tag: "AWS.SQS.PurgeQueue",
    operation: sqs.purgeQueue,
    actions: ["sqs:PurgeQueue"],
}));
//# sourceMappingURL=PurgeQueueHttp.js.map