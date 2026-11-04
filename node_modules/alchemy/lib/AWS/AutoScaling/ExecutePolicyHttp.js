import * as autoscaling from "@distilled.cloud/aws/auto-scaling";
import * as Layer from "effect/Layer";
import { makeGroupHttpBinding } from "./BindingHttp.js";
import { ExecutePolicy } from "./ExecutePolicy.js";
export const ExecutePolicyHttp = Layer.effect(ExecutePolicy, makeGroupHttpBinding({
    tag: "AWS.AutoScaling.ExecutePolicy",
    operation: autoscaling.executePolicy,
    actions: ["autoscaling:ExecutePolicy"],
}));
//# sourceMappingURL=ExecutePolicyHttp.js.map