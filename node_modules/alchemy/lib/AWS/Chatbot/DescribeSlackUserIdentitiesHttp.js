import * as chatbot from "@distilled.cloud/aws/chatbot";
import * as Layer from "effect/Layer";
import { makeChatbotAccountHttpBinding } from "./BindingHttp.js";
import { DescribeSlackUserIdentities } from "./DescribeSlackUserIdentities.js";
export const DescribeSlackUserIdentitiesHttp = Layer.effect(DescribeSlackUserIdentities, makeChatbotAccountHttpBinding({
    tag: "AWS.Chatbot.DescribeSlackUserIdentities",
    operation: chatbot.describeSlackUserIdentities,
    actions: ["chatbot:DescribeSlackUserIdentities"],
}));
//# sourceMappingURL=DescribeSlackUserIdentitiesHttp.js.map