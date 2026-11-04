import * as comprehend from "@distilled.cloud/aws/comprehend";
import * as Layer from "effect/Layer";
import { makeComprehendHttpBinding } from "./BindingHttp.js";
import { DetectKeyPhrases } from "./DetectKeyPhrases.js";
export const DetectKeyPhrasesHttp = Layer.effect(DetectKeyPhrases, makeComprehendHttpBinding({
    tag: "AWS.Comprehend.DetectKeyPhrases",
    operation: comprehend.detectKeyPhrases,
    actions: ["comprehend:DetectKeyPhrases"],
}));
//# sourceMappingURL=DetectKeyPhrasesHttp.js.map