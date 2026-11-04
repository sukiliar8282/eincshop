import { ResumeService } from "./ResumeService.ts";
/**
 * HTTP implementation of the {@link ResumeService} binding. Calls
 * `apprunner:ResumeService` with the Lambda's IAM role, scoped to the bound
 * service.
 */
export declare const ResumeServiceHttp: import("effect/Layer").Layer<ResumeService, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ResumeServiceHttp.d.ts.map