import * as eks from "@distilled.cloud/aws/eks";
import * as Layer from "effect/Layer";
import { makeEKSClusterHttpBinding } from "./BindingHttp.js";
import { DescribeUpdate } from "./DescribeUpdate.js";
export const DescribeUpdateHttp = Layer.effect(DescribeUpdate, makeEKSClusterHttpBinding({
    tag: "AWS.EKS.DescribeUpdate",
    operation: eks.describeUpdate,
    actions: ["eks:DescribeUpdate"],
    key: "name",
    scope: "both",
}));
//# sourceMappingURL=DescribeUpdateHttp.js.map