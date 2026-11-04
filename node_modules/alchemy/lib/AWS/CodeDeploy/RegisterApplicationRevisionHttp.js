import * as codedeploy from "@distilled.cloud/aws/codedeploy";
import * as Layer from "effect/Layer";
import { makeCodeDeployApplicationHttpBinding } from "./BindingHttp.js";
import { RegisterApplicationRevision } from "./RegisterApplicationRevision.js";
export const RegisterApplicationRevisionHttp = Layer.effect(RegisterApplicationRevision, makeCodeDeployApplicationHttpBinding({
    tag: "AWS.CodeDeploy.RegisterApplicationRevision",
    operation: codedeploy.registerApplicationRevision,
    actions: ["codedeploy:RegisterApplicationRevision"],
}));
//# sourceMappingURL=RegisterApplicationRevisionHttp.js.map