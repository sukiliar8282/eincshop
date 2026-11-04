import * as ECS from "@distilled.cloud/aws/ecs";
import * as Layer from "effect/Layer";
import { makeEcsTaskLaunchHttpBinding } from "./BindingHttp.js";
import { RunTask } from "./RunTask.js";
export const RunTaskHttp = Layer.effect(RunTask, makeEcsTaskLaunchHttpBinding({
    tag: "AWS.ECS.RunTask",
    operation: ECS.runTask,
    actions: ["ecs:RunTask"],
}));
//# sourceMappingURL=RunTaskHttp.js.map