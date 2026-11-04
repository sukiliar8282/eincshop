import { ValidateConfiguration } from "./ValidateConfiguration.ts";
/**
 * HTTP implementation of the {@link ValidateConfiguration} binding. Calls
 * `appconfig:ValidateConfiguration` with the Lambda's IAM role, scoped to
 * the bound configuration profile.
 */
export declare const ValidateConfigurationHttp: import("effect/Layer").Layer<ValidateConfiguration, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ValidateConfigurationHttp.d.ts.map