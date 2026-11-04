import * as ECS from "@distilled.cloud/aws/ecs";
import * as Layer from "effect/Layer";
import { makeEcsClusterHttpBinding } from "./BindingHttp.js";
import { ListContainerInstances } from "./ListContainerInstances.js";
export const ListContainerInstancesHttp = Layer.effect(ListContainerInstances, makeEcsClusterHttpBinding({
    tag: "AWS.ECS.ListContainerInstances",
    operation: ECS.listContainerInstances,
    actions: ["ecs:ListContainerInstances"],
    // `ecs:ListContainerInstances` authorizes against the cluster.
    resources: ["cluster"],
}));
//# sourceMappingURL=ListContainerInstancesHttp.js.map