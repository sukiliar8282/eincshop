import * as amplify from "@distilled.cloud/aws/amplify";
import * as Layer from "effect/Layer";
import * as Output from "../../Output.js";
import { makeAmplifyHttpBinding } from "./BindingHttp.js";
import { ListArtifacts } from "./ListArtifacts.js";
export const ListArtifactsHttp = Layer.effect(ListArtifacts, makeAmplifyHttpBinding({
    name: "ListArtifacts",
    operation: amplify.listArtifacts,
    actions: ["amplify:ListArtifacts"],
    resources: (app) => [Output.interpolate `${app.appArn}/branches/*/jobs/*`],
}));
//# sourceMappingURL=ListArtifactsHttp.js.map