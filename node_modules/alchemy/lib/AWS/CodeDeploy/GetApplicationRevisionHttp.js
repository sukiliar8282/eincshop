import * as codedeploy from "@distilled.cloud/aws/codedeploy";
import * as Layer from "effect/Layer";
import { makeCodeDeployApplicationHttpBinding } from "./BindingHttp.js";
import { GetApplicationRevision } from "./GetApplicationRevision.js";
export const GetApplicationRevisionHttp = Layer.effect(GetApplicationRevision, makeCodeDeployApplicationHttpBinding({
    tag: "AWS.CodeDeploy.GetApplicationRevision",
    operation: codedeploy.getApplicationRevision,
    actions: ["codedeploy:GetApplicationRevision"],
}));
//# sourceMappingURL=GetApplicationRevisionHttp.js.map