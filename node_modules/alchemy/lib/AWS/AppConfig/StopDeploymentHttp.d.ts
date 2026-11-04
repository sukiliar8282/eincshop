import { StopDeployment } from "./StopDeployment.ts";
/**
 * HTTP implementation of the {@link StopDeployment} binding. Calls
 * `appconfig:StopDeployment` with the Lambda's IAM role, scoped to the bound
 * environment's deployments.
 */
export declare const StopDeploymentHttp: import("effect/Layer").Layer<StopDeployment, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=StopDeploymentHttp.d.ts.map