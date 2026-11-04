import * as comprehend from "@distilled.cloud/aws/comprehend";
import * as Layer from "effect/Layer";
import { makeComprehendHttpBinding } from "./BindingHttp.js";
import { DetectSyntax } from "./DetectSyntax.js";
export const DetectSyntaxHttp = Layer.effect(DetectSyntax, makeComprehendHttpBinding({
    tag: "AWS.Comprehend.DetectSyntax",
    operation: comprehend.detectSyntax,
    actions: ["comprehend:DetectSyntax"],
}));
//# sourceMappingURL=DetectSyntaxHttp.js.map