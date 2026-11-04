import * as codedeploy from "@distilled.cloud/aws/codedeploy";
import * as Layer from "effect/Layer";
import { makeCodeDeployGroupNameHttpBinding } from "./BindingHttp.js";
import { ListDeployments } from "./ListDeployments.js";
export const ListDeploymentsHttp = Layer.effect(ListDeployments, makeCodeDeployGroupNameHttpBinding({
    tag: "AWS.CodeDeploy.ListDeployments",
    operation: codedeploy.listDeployments,
    actions: ["codedeploy:ListDeployments"],
}));
//# sourceMappingURL=ListDeploymentsHttp.js.map