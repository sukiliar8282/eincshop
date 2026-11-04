import * as Layer from "effect/Layer";
import { EvaluateMappingTemplate } from "./EvaluateMappingTemplate.ts";
/**
 * HTTP implementation of the {@link EvaluateMappingTemplate} binding. Calls
 * `appsync:EvaluateMappingTemplate` with the host Function's IAM role. The
 * action defines no IAM resource types, so the grant is necessarily
 * `Resource: "*"`.
 */
export declare const EvaluateMappingTemplateHttp: Layer.Layer<EvaluateMappingTemplate, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=EvaluateMappingTemplateHttp.d.ts.map