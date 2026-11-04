import * as autoscaling from "@distilled.cloud/aws/auto-scaling";
import * as Layer from "effect/Layer";
import { makeGroupHttpBinding } from "./BindingHttp.js";
import { SetInstanceProtection } from "./SetInstanceProtection.js";
export const SetInstanceProtectionHttp = Layer.effect(SetInstanceProtection, makeGroupHttpBinding({
    tag: "AWS.AutoScaling.SetInstanceProtection",
    operation: autoscaling.setInstanceProtection,
    actions: ["autoscaling:SetInstanceProtection"],
}));
//# sourceMappingURL=SetInstanceProtectionHttp.js.map