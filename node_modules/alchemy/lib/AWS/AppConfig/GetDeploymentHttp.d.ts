import { GetDeployment } from "./GetDeployment.ts";
/**
 * HTTP implementation of the {@link GetDeployment} binding. Calls
 * `appconfig:GetDeployment` with the Lambda's IAM role, scoped to the bound
 * environment's deployments.
 */
export declare const GetDeploymentHttp: import("effect/Layer").Layer<GetDeployment, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GetDeploymentHttp.d.ts.map