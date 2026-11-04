import * as codedeploy from "@distilled.cloud/aws/codedeploy";
import * as Layer from "effect/Layer";
import { makeCodeDeployGroupHttpBinding } from "./BindingHttp.js";
import { StopDeployment } from "./StopDeployment.js";
export const StopDeploymentHttp = Layer.effect(StopDeployment, makeCodeDeployGroupHttpBinding({
    tag: "AWS.CodeDeploy.StopDeployment",
    operation: codedeploy.stopDeployment,
    actions: ["codedeploy:StopDeployment"],
}));
//# sourceMappingURL=StopDeploymentHttp.js.map