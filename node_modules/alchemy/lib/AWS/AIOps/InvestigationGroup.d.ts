import * as aiops from "@distilled.cloud/aws/aiops";
import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { PolicyStatement } from "../IAM/Policy.ts";
import type { Providers } from "../Providers.ts";
export interface InvestigationGroupEncryptionConfiguration {
    /**
     * How investigation data is encrypted — `"AWS_OWNED_KEY"` (the default,
     * an AWS owned key) or `"CUSTOMER_MANAGED_KMS_KEY"`.
     * @default "AWS_OWNED_KEY"
     */
    type?: aiops.EncryptionConfigurationType;
    /**
     * ID or ARN of the customer managed KMS key to encrypt investigation data
     * with. Required when `type` is `"CUSTOMER_MANAGED_KMS_KEY"`.
     */
    kmsKeyId?: string;
}
export interface InvestigationGroupCrossAccountConfiguration {
    /**
     * ARN of an IAM role in a source account that CloudWatch investigations
     * assumes to retrieve telemetry during cross-account investigations.
     */
    sourceRoleArn: string;
}
export interface InvestigationGroupProps {
    /**
     * Name of the investigation group. If omitted, a deterministic physical
     * name is generated from the app, stage, and logical ID.
     *
     * Changing the name replaces the investigation group.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * ARN of the IAM role that CloudWatch investigations assumes to access
     * telemetry (CloudWatch, X-Ray, CloudTrail, ...) during investigations.
     * The role's trust policy must allow the `aiops.amazonaws.com` service
     * principal to assume it.
     */
    roleArn: string;
    /**
     * How long investigations and their data are retained (e.g. `"7 days"`
     * or `Duration.days(7)`). Rounded to whole days on the wire
     * (`retentionInDays`).
     * The retention period cannot be updated in place — changing it replaces
     * the investigation group.
     * @default 90 days
     */
    retention?: Duration.Input;
    /**
     * Encryption configuration for investigation data. Omit to use an AWS
     * owned key.
     * @default AWS owned key
     */
    encryptionConfiguration?: InvestigationGroupEncryptionConfiguration;
    /**
     * Tag keys whose values CloudWatch investigations uses as boundaries to
     * narrow the search for related telemetry (useful when resource names
     * repeat across applications).
     */
    tagKeyBoundaries?: string[];
    /**
     * Map of Amazon Q Developer in chat applications configuration ARNs to
     * SNS topic ARNs, used to send investigation updates to chat channels.
     */
    chatbotNotificationChannel?: Record<string, string[]>;
    /**
     * Whether investigations can query CloudTrail event history for the past
     * seven days of events.
     * @default true
     */
    isCloudTrailEventHistoryEnabled?: boolean;
    /**
     * Source-account role configurations for cross-account investigations.
     */
    crossAccountConfigurations?: InvestigationGroupCrossAccountConfiguration[];
    /**
     * IAM resource-policy statements attached to the investigation group,
     * granting other principals or AWS services (for example
     * `aiops.alarms.cloudwatch.amazonaws.com`, so CloudWatch alarms can start
     * investigations) access to it. Serialized as a `2012-10-17` policy
     * document via `PutInvestigationGroupPolicy`.
     *
     * Omit to leave any existing policy unmanaged; pass `[]` to delete a
     * previously attached policy.
     */
    policy?: PolicyStatement[];
    /**
     * Tags to apply to the investigation group. Merged with internal Alchemy
     * tags.
     */
    tags?: Record<string, string>;
}
export interface InvestigationGroup extends Resource<"AWS.AIOps.InvestigationGroup", InvestigationGroupProps, {
    /** Name of the investigation group. */
    name: string;
    /** ARN of the investigation group. */
    arn: string;
    /** ARN of the IAM role investigations assume to access telemetry. */
    roleArn: string | undefined;
    /**
     * How long investigations and their data are retained, in whole days
     * (the AWS wire unit for the `retention` prop).
     */
    retentionInDays: number | undefined;
}, never, Providers> {
}
/**
 * A CloudWatch investigations *investigation group* — the one-time,
 * per-Region container that configures who can run AI-assisted operational
 * investigations, which IAM role is used to access telemetry, how long
 * investigation data is retained, and how it is encrypted.
 *
 * You can have at most one investigation group per Region in an account, so
 * replacements are performed delete-first.
 * ### Creating an Investigation Group
 * **Example:** Basic Investigation Group
 * ```typescript
 * import * as AIOps from "alchemy/AWS/AIOps";
 * import * as IAM from "alchemy/AWS/IAM";
 *
 * const role = yield* IAM.Role("InvestigationsRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Effect: "Allow",
 *       Principal: { Service: "aiops.amazonaws.com" },
 *       Action: ["sts:AssumeRole"],
 *     }],
 *   },
 *   managedPolicyArns: ["arn:aws:iam::aws:policy/AIOpsAssistantPolicy"],
 * });
 *
 * const group = yield* AIOps.InvestigationGroup("Investigations", {
 *   roleArn: role.roleArn,
 * });
 * ```
 *
 * **Example:** Short Retention and Tag Boundaries
 * ```typescript
 * const group = yield* AIOps.InvestigationGroup("Investigations", {
 *   roleArn: role.roleArn,
 *   retention: "7 days",
 *   tagKeyBoundaries: ["Application"],
 *   tags: { Environment: "test" },
 * });
 * ```
 *
 * ### Resource Policy
 * **Example:** Let CloudWatch Alarms Start Investigations
 * ```typescript
 * const group = yield* AIOps.InvestigationGroup("Investigations", {
 *   roleArn: role.roleArn,
 *   policy: [{
 *     Effect: "Allow",
 *     Principal: { Service: "aiops.alarms.cloudwatch.amazonaws.com" },
 *     Action: ["aiops:CreateInvestigation", "aiops:CreateInvestigationEvent"],
 *     Resource: "*",
 *     Condition: {
 *       StringEquals: { "aws:SourceAccount": "111122223333" },
 *       ArnLike: { "aws:SourceArn": "arn:aws:cloudwatch:us-east-1:111122223333:alarm:*" },
 *     },
 *   }],
 * });
 * ```
 *
 * @resource
 */
export declare const InvestigationGroup: import("../../Resource.ts").ResourceClass<InvestigationGroup>;
export declare const InvestigationGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<InvestigationGroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=InvestigationGroup.d.ts.map