import * as codedeploy from "@distilled.cloud/aws/codedeploy";
import * as Layer from "effect/Layer";
import { makeCodeDeployGroupHttpBinding } from "./BindingHttp.js";
import { ListDeploymentTargets } from "./ListDeploymentTargets.js";
export const ListDeploymentTargetsHttp = Layer.effect(ListDeploymentTargets, makeCodeDeployGroupHttpBinding({
    tag: "AWS.CodeDeploy.ListDeploymentTargets",
    operation: codedeploy.listDeploymentTargets,
    actions: ["codedeploy:ListDeploymentTargets"],
}));
//# sourceMappingURL=ListDeploymentTargetsHttp.js.map