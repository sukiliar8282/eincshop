import * as cloudhsm from "@distilled.cloud/aws/cloudhsm-v2";
import * as Layer from "effect/Layer";
import { makeCloudHsmHttpBinding } from "./BindingHttp.js";
import { GetResourcePolicy } from "./GetResourcePolicy.js";
export const GetResourcePolicyHttp = Layer.effect(GetResourcePolicy, makeCloudHsmHttpBinding({
    tag: "AWS.CloudHSMV2.GetResourcePolicy",
    operation: cloudhsm.getResourcePolicy,
    actions: ["cloudhsm:GetResourcePolicy"],
}));
//# sourceMappingURL=GetResourcePolicyHttp.js.map