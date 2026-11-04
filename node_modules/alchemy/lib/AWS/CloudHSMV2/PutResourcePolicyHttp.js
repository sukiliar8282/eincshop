import * as cloudhsm from "@distilled.cloud/aws/cloudhsm-v2";
import * as Layer from "effect/Layer";
import { makeCloudHsmHttpBinding } from "./BindingHttp.js";
import { PutResourcePolicy } from "./PutResourcePolicy.js";
export const PutResourcePolicyHttp = Layer.effect(PutResourcePolicy, makeCloudHsmHttpBinding({
    tag: "AWS.CloudHSMV2.PutResourcePolicy",
    operation: cloudhsm.putResourcePolicy,
    actions: ["cloudhsm:PutResourcePolicy"],
}));
//# sourceMappingURL=PutResourcePolicyHttp.js.map