import * as Kinesis from "@distilled.cloud/aws/kinesis";
import * as Layer from "effect/Layer";
import { makeStreamHttpBinding } from "./BindingHttp.js";
import { GetResourcePolicy } from "./GetResourcePolicy.js";
export const GetResourcePolicyHttp = Layer.effect(GetResourcePolicy, makeStreamHttpBinding({
    tag: "AWS.Kinesis.GetResourcePolicy",
    operation: Kinesis.getResourcePolicy,
    actions: ["kinesis:GetResourcePolicy"],
    key: "ResourceARN",
}));
//# sourceMappingURL=GetResourcePolicyHttp.js.map