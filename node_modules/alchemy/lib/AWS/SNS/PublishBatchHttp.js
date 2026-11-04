import * as sns from "@distilled.cloud/aws/sns";
import * as Layer from "effect/Layer";
import { makeSnsTopicHttpBinding } from "./BindingHttp.js";
import { PublishBatch } from "./PublishBatch.js";
export const PublishBatchHttp = Layer.effect(PublishBatch, makeSnsTopicHttpBinding({
    tag: "AWS.SNS.PublishBatch",
    operation: sns.publishBatch,
    actions: ["sns:Publish"],
    key: "TopicArn",
}));
//# sourceMappingURL=PublishBatchHttp.js.map