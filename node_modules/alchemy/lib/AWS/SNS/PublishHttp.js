import * as sns from "@distilled.cloud/aws/sns";
import * as Layer from "effect/Layer";
import { makeSnsTopicHttpBinding } from "./BindingHttp.js";
import { Publish } from "./Publish.js";
export const PublishHttp = Layer.effect(Publish, makeSnsTopicHttpBinding({
    tag: "AWS.SNS.Publish",
    operation: sns.publish,
    actions: ["sns:Publish"],
    key: "TopicArn",
}));
//# sourceMappingURL=PublishHttp.js.map