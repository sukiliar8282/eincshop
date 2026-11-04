import { CreateHostedConfigurationVersion } from "./CreateHostedConfigurationVersion.ts";
/**
 * HTTP implementation of the {@link CreateHostedConfigurationVersion}
 * binding. Calls `appconfig:CreateHostedConfigurationVersion` with the
 * Lambda's IAM role, scoped to the bound configuration profile and its
 * hosted versions.
 */
export declare const CreateHostedConfigurationVersionHttp: import("effect/Layer").Layer<CreateHostedConfigurationVersion, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=CreateHostedConfigurationVersionHttp.d.ts.map