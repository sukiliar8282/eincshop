import * as fms from "@distilled.cloud/aws/fms";
import * as Layer from "effect/Layer";
import { makeFmsHttpBinding } from "./BindingHttp.js";
import { GetPolicy } from "./GetPolicy.js";
export const GetPolicyHttp = Layer.effect(GetPolicy, makeFmsHttpBinding({
    capability: "GetPolicy",
    iamActions: ["fms:GetPolicy"],
    operation: fms.getPolicy,
}));
//# sourceMappingURL=GetPolicyHttp.js.map