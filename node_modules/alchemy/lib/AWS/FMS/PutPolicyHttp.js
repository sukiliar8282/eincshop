import * as fms from "@distilled.cloud/aws/fms";
import * as Layer from "effect/Layer";
import { makeFmsHttpBinding } from "./BindingHttp.js";
import { PutPolicy } from "./PutPolicy.js";
export const PutPolicyHttp = Layer.effect(PutPolicy, makeFmsHttpBinding({
    capability: "PutPolicy",
    iamActions: ["fms:PutPolicy"],
    operation: fms.putPolicy,
}));
//# sourceMappingURL=PutPolicyHttp.js.map