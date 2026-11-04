import * as sns from "@distilled.cloud/aws/sns";
import * as Layer from "effect/Layer";
import { makeSnsTopicHttpBinding } from "./BindingHttp.js";
import { Subscribe } from "./Subscribe.js";
export const SubscribeHttp = Layer.effect(Subscribe, makeSnsTopicHttpBinding({
    tag: "AWS.SNS.Subscribe",
    operation: sns.subscribe,
    actions: ["sns:Subscribe"],
    key: "TopicArn",
}));
//# sourceMappingURL=SubscribeHttp.js.map