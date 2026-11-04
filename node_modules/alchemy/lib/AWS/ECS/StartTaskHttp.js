import * as ECS from "@distilled.cloud/aws/ecs";
import * as Layer from "effect/Layer";
import { makeEcsTaskLaunchHttpBinding } from "./BindingHttp.js";
import { StartTask } from "./StartTask.js";
export const StartTaskHttp = Layer.effect(StartTask, makeEcsTaskLaunchHttpBinding({
    tag: "AWS.ECS.StartTask",
    operation: ECS.startTask,
    actions: ["ecs:StartTask"],
}));
//# sourceMappingURL=StartTaskHttp.js.map