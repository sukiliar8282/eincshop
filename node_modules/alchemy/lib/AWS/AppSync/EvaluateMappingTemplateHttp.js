import * as appsync from "@distilled.cloud/aws/appsync";
import * as Layer from "effect/Layer";
import { makeAppSyncAccountHttpBinding } from "./BindingHttp.js";
import { EvaluateMappingTemplate } from "./EvaluateMappingTemplate.js";
/**
 * HTTP implementation of the {@link EvaluateMappingTemplate} binding. Calls
 * `appsync:EvaluateMappingTemplate` with the host Function's IAM role. The
 * action defines no IAM resource types, so the grant is necessarily
 * `Resource: "*"`.
 */
export const EvaluateMappingTemplateHttp = Layer.effect(EvaluateMappingTemplate, makeAppSyncAccountHttpBinding({
    tag: "AWS.AppSync.EvaluateMappingTemplate",
    actions: ["appsync:EvaluateMappingTemplate"],
    operation: appsync.evaluateMappingTemplate,
}));
//# sourceMappingURL=EvaluateMappingTemplateHttp.js.map