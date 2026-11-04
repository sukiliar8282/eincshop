import * as comprehend from "@distilled.cloud/aws/comprehend";
import * as Layer from "effect/Layer";
import { makeComprehendHttpBinding } from "./BindingHttp.js";
import { DetectEntities } from "./DetectEntities.js";
export const DetectEntitiesHttp = Layer.effect(DetectEntities, makeComprehendHttpBinding({
    tag: "AWS.Comprehend.DetectEntities",
    operation: comprehend.detectEntities,
    actions: ["comprehend:DetectEntities"],
}));
//# sourceMappingURL=DetectEntitiesHttp.js.map