import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface TargetAccountConfigurationProps {
    /**
     * The ID of the experiment template the target account belongs to. The
     * template must use `accountTargeting: "multi-account"`. Changing it
     * replaces the configuration.
     */
    experimentTemplateId: string;
    /**
     * The AWS account ID of the target account. Changing it replaces the
     * configuration.
     */
    accountId: string;
    /**
     * The ARN of an IAM role in the target account that grants FIS permission
     * to perform the experiment's actions there. The role must trust
     * `fis.amazonaws.com`.
     */
    roleArn: string;
    /**
     * A description of the target account. Once set, it cannot be fully
     * removed via the API — only changed.
     */
    description?: string;
}
export interface TargetAccountConfiguration extends Resource<"AWS.FIS.TargetAccountConfiguration", TargetAccountConfigurationProps, {
    /**
     * The ID of the experiment template the target account belongs to.
     */
    experimentTemplateId: string;
    /**
     * The AWS account ID of the target account.
     */
    accountId: string;
    /**
     * The ARN of the IAM role FIS assumes in the target account.
     */
    roleArn: string;
}, never, Providers> {
}
/**
 * A target account configuration for a multi-account AWS Fault Injection
 * Service (FIS) experiment template — registers an AWS account (and the IAM
 * role FIS assumes there) as a target of the experiment, so a single
 * experiment can inject faults into resources across accounts.
 *
 * The parent {@link ExperimentTemplate} must declare
 * `experimentOptions: { accountTargeting: "multi-account" }`.
 * ### Registering Target Accounts
 * **Example:** Add a Target Account to a Multi-Account Template
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const template = yield* AWS.FIS.ExperimentTemplate("CrossAccount", {
 *   roleArn: orchestratorRole.roleArn,
 *   experimentOptions: { accountTargeting: "multi-account" },
 *   actions: {
 *     Wait: { actionId: "aws:fis:wait", parameters: { duration: "PT1M" } },
 *   },
 * });
 *
 * const target = yield* AWS.FIS.TargetAccountConfiguration("WorkloadAccount", {
 *   experimentTemplateId: template.id,
 *   accountId: "111122223333",
 *   roleArn: "arn:aws:iam::111122223333:role/FisTargetRole",
 *   description: "the workload account faults are injected into",
 * });
 * ```
 *
 * @resource
 */
export declare const TargetAccountConfiguration: import("../../Resource.ts").ResourceClass<TargetAccountConfiguration>;
export declare const TargetAccountConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<TargetAccountConfiguration>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=TargetAccountConfiguration.d.ts.map