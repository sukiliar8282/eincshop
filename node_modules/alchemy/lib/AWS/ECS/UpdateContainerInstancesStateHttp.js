import * as ECS from "@distilled.cloud/aws/ecs";
import * as Layer from "effect/Layer";
import { makeEcsClusterHttpBinding } from "./BindingHttp.js";
import { UpdateContainerInstancesState } from "./UpdateContainerInstancesState.js";
export const UpdateContainerInstancesStateHttp = Layer.effect(UpdateContainerInstancesState, makeEcsClusterHttpBinding({
    tag: "AWS.ECS.UpdateContainerInstancesState",
    operation: ECS.updateContainerInstancesState,
    actions: ["ecs:UpdateContainerInstancesState"],
    // Authorizes against the container-instance resource:
    // arn:aws:ecs:{region}:{account}:container-instance/{clusterName}/*
    resources: ["container-instance"],
}));
//# sourceMappingURL=UpdateContainerInstancesStateHttp.js.map