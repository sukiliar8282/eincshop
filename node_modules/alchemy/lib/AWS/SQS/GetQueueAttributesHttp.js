import * as sqs from "@distilled.cloud/aws/sqs";
import * as Layer from "effect/Layer";
import { makeQueueUrlHttpBinding } from "./BindingHttp.js";
import { GetQueueAttributes } from "./GetQueueAttributes.js";
export const GetQueueAttributesHttp = Layer.effect(GetQueueAttributes, makeQueueUrlHttpBinding({
    tag: "AWS.SQS.GetQueueAttributes",
    operation: sqs.getQueueAttributes,
    actions: ["sqs:GetQueueAttributes"],
}));
//# sourceMappingURL=GetQueueAttributesHttp.js.map