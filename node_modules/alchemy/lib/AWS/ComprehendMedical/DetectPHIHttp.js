import * as comprehendmedical from "@distilled.cloud/aws/comprehendmedical";
import * as Layer from "effect/Layer";
import { makeComprehendMedicalHttpBinding } from "./BindingHttp.js";
import { DetectPHI } from "./DetectPHI.js";
export const DetectPHIHttp = Layer.effect(DetectPHI, makeComprehendMedicalHttpBinding({
    capability: "DetectPHI",
    iamActions: ["comprehendmedical:DetectPHI"],
    operation: comprehendmedical.detectPHI,
}));
//# sourceMappingURL=DetectPHIHttp.js.map