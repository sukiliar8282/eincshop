import * as ECS from "@distilled.cloud/aws/ecs";
import * as Layer from "effect/Layer";
import { makeEcsClusterHttpBinding } from "./BindingHttp.js";
import { ListTasks } from "./ListTasks.js";
export const ListTasksHttp = Layer.effect(ListTasks, makeEcsClusterHttpBinding({
    tag: "AWS.ECS.ListTasks",
    operation: ECS.listTasks,
    actions: ["ecs:ListTasks"],
    // `ecs:ListTasks` has no useful resource-level scoping on Fargate (its
    // resource type is container-instance), so grant `*` conditioned on the
    // bound cluster.
    resources: "cluster-condition",
}));
//# sourceMappingURL=ListTasksHttp.js.map