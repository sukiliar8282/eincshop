import * as ECS from "@distilled.cloud/aws/ecs";
import * as Layer from "effect/Layer";
import { makeEcsClusterHttpBinding } from "./BindingHttp.js";
import { ExecuteCommand } from "./ExecuteCommand.js";
export const ExecuteCommandHttp = Layer.effect(ExecuteCommand, makeEcsClusterHttpBinding({
    tag: "AWS.ECS.ExecuteCommand",
    operation: ECS.executeCommand,
    actions: ["ecs:ExecuteCommand"],
    // `ecs:ExecuteCommand` authorizes against both the cluster and the task.
    resources: ["cluster", "task"],
}));
//# sourceMappingURL=ExecuteCommandHttp.js.map