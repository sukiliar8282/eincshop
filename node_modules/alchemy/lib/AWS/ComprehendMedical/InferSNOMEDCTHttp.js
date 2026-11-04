import * as comprehendmedical from "@distilled.cloud/aws/comprehendmedical";
import * as Layer from "effect/Layer";
import { makeComprehendMedicalHttpBinding } from "./BindingHttp.js";
import { InferSNOMEDCT } from "./InferSNOMEDCT.js";
export const InferSNOMEDCTHttp = Layer.effect(InferSNOMEDCT, makeComprehendMedicalHttpBinding({
    capability: "InferSNOMEDCT",
    iamActions: ["comprehendmedical:InferSNOMEDCT"],
    operation: comprehendmedical.inferSNOMEDCT,
}));
//# sourceMappingURL=InferSNOMEDCTHttp.js.map