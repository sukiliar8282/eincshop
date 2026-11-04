import * as elbv2 from "@distilled.cloud/aws/elastic-load-balancing-v2";
import * as Layer from "effect/Layer";
import { makeTargetGroupHttpBinding } from "./BindingHttp.js";
import { RegisterTargets } from "./RegisterTargets.js";
export const RegisterTargetsHttp = Layer.effect(RegisterTargets, makeTargetGroupHttpBinding({
    tag: "AWS.ELBv2.RegisterTargets",
    operation: elbv2.registerTargets,
    actions: ["elasticloadbalancing:RegisterTargets"],
}));
//# sourceMappingURL=RegisterTargetsHttp.js.map