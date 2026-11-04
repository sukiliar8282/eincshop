import * as qbusiness from "@distilled.cloud/aws/qbusiness";
import * as Layer from "effect/Layer";
import { makeQBusinessApplicationHttpBinding } from "./BindingHttp.js";
import { GetPolicy } from "./GetPolicy.js";
export const GetPolicyHttp = Layer.effect(GetPolicy, makeQBusinessApplicationHttpBinding({
    tag: "AWS.QBusiness.GetPolicy",
    operation: qbusiness.getPolicy,
    actions: ["qbusiness:GetPolicy"],
}));
//# sourceMappingURL=GetPolicyHttp.js.map