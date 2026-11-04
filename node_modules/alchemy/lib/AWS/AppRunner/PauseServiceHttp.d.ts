import { PauseService } from "./PauseService.ts";
/**
 * HTTP implementation of the {@link PauseService} binding. Calls
 * `apprunner:PauseService` with the Lambda's IAM role, scoped to the bound
 * service.
 */
export declare const PauseServiceHttp: import("effect/Layer").Layer<PauseService, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=PauseServiceHttp.d.ts.map