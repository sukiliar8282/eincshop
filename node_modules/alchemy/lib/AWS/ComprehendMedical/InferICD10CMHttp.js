import * as comprehendmedical from "@distilled.cloud/aws/comprehendmedical";
import * as Layer from "effect/Layer";
import { makeComprehendMedicalHttpBinding } from "./BindingHttp.js";
import { InferICD10CM } from "./InferICD10CM.js";
export const InferICD10CMHttp = Layer.effect(InferICD10CM, makeComprehendMedicalHttpBinding({
    capability: "InferICD10CM",
    iamActions: ["comprehendmedical:InferICD10CM"],
    operation: comprehendmedical.inferICD10CM,
}));
//# sourceMappingURL=InferICD10CMHttp.js.map