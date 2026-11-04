import * as comprehend from "@distilled.cloud/aws/comprehend";
import * as Layer from "effect/Layer";
import { makeComprehendHttpBinding } from "./BindingHttp.js";
import { DetectToxicContent } from "./DetectToxicContent.js";
export const DetectToxicContentHttp = Layer.effect(DetectToxicContent, makeComprehendHttpBinding({
    tag: "AWS.Comprehend.DetectToxicContent",
    operation: comprehend.detectToxicContent,
    actions: ["comprehend:DetectToxicContent"],
}));
//# sourceMappingURL=DetectToxicContentHttp.js.map