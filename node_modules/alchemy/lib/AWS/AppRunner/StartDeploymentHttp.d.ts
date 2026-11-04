import { StartDeployment } from "./StartDeployment.ts";
/**
 * HTTP implementation of the {@link StartDeployment} binding. Calls
 * `apprunner:StartDeployment` with the Lambda's IAM role, scoped to the
 * bound service.
 */
export declare const StartDeploymentHttp: import("effect/Layer").Layer<StartDeployment, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=StartDeploymentHttp.d.ts.map