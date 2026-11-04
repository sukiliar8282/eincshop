import * as iam from "@distilled.cloud/aws/iam";
import * as Layer from "effect/Layer";
import { makeIamHttpBinding } from "./BindingHttp.js";
import { SimulateCustomPolicy } from "./SimulateCustomPolicy.js";
export const SimulateCustomPolicyHttp = Layer.effect(SimulateCustomPolicy, makeIamHttpBinding({
    capability: "SimulateCustomPolicy",
    iamActions: ["iam:SimulateCustomPolicy"],
    operation: iam.simulateCustomPolicy,
}));
//# sourceMappingURL=SimulateCustomPolicyHttp.js.map