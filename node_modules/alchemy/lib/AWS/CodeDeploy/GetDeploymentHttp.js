import * as codedeploy from "@distilled.cloud/aws/codedeploy";
import * as Layer from "effect/Layer";
import { makeCodeDeployGroupHttpBinding } from "./BindingHttp.js";
import { GetDeployment } from "./GetDeployment.js";
export const GetDeploymentHttp = Layer.effect(GetDeployment, makeCodeDeployGroupHttpBinding({
    tag: "AWS.CodeDeploy.GetDeployment",
    operation: codedeploy.getDeployment,
    actions: ["codedeploy:GetDeployment"],
}));
//# sourceMappingURL=GetDeploymentHttp.js.map