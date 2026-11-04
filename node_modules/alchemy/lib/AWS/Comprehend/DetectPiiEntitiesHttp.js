import * as comprehend from "@distilled.cloud/aws/comprehend";
import * as Layer from "effect/Layer";
import { makeComprehendHttpBinding } from "./BindingHttp.js";
import { DetectPiiEntities } from "./DetectPiiEntities.js";
export const DetectPiiEntitiesHttp = Layer.effect(DetectPiiEntities, makeComprehendHttpBinding({
    tag: "AWS.Comprehend.DetectPiiEntities",
    operation: comprehend.detectPiiEntities,
    actions: ["comprehend:DetectPiiEntities"],
}));
//# sourceMappingURL=DetectPiiEntitiesHttp.js.map