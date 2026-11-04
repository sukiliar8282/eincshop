import * as codedeploy from "@distilled.cloud/aws/codedeploy";
import * as Layer from "effect/Layer";
import { makeCodeDeployApplicationHttpBinding } from "./BindingHttp.js";
import { ListApplicationRevisions } from "./ListApplicationRevisions.js";
export const ListApplicationRevisionsHttp = Layer.effect(ListApplicationRevisions, makeCodeDeployApplicationHttpBinding({
    tag: "AWS.CodeDeploy.ListApplicationRevisions",
    operation: codedeploy.listApplicationRevisions,
    actions: ["codedeploy:ListApplicationRevisions"],
}));
//# sourceMappingURL=ListApplicationRevisionsHttp.js.map