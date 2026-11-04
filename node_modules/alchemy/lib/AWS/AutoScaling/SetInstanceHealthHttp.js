import * as autoscaling from "@distilled.cloud/aws/auto-scaling";
import * as Layer from "effect/Layer";
import { makeGroupHttpBinding } from "./BindingHttp.js";
import { SetInstanceHealth } from "./SetInstanceHealth.js";
export const SetInstanceHealthHttp = Layer.effect(SetInstanceHealth, makeGroupHttpBinding({
    tag: "AWS.AutoScaling.SetInstanceHealth",
    operation: autoscaling.setInstanceHealth,
    actions: ["autoscaling:SetInstanceHealth"],
}));
//# sourceMappingURL=SetInstanceHealthHttp.js.map