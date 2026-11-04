import * as amplify from "@distilled.cloud/aws/amplify";
import * as Layer from "effect/Layer";
import * as Output from "../../Output.js";
import { makeAmplifyHttpBinding } from "./BindingHttp.js";
import { StartDeployment } from "./StartDeployment.js";
export const StartDeploymentHttp = Layer.effect(StartDeployment, makeAmplifyHttpBinding({
    name: "StartDeployment",
    operation: amplify.startDeployment,
    actions: ["amplify:StartDeployment"],
    resources: (app) => [Output.interpolate `${app.appArn}/branches/*`],
}));
//# sourceMappingURL=StartDeploymentHttp.js.map