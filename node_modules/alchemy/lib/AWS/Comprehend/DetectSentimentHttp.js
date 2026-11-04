import * as comprehend from "@distilled.cloud/aws/comprehend";
import * as Layer from "effect/Layer";
import { makeComprehendHttpBinding } from "./BindingHttp.js";
import { DetectSentiment } from "./DetectSentiment.js";
export const DetectSentimentHttp = Layer.effect(DetectSentiment, makeComprehendHttpBinding({
    tag: "AWS.Comprehend.DetectSentiment",
    operation: comprehend.detectSentiment,
    actions: ["comprehend:DetectSentiment"],
}));
//# sourceMappingURL=DetectSentimentHttp.js.map