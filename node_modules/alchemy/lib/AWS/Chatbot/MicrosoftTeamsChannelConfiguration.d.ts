import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface MicrosoftTeamsChannelConfigurationProps {
    /**
     * Name of the configuration (1-128 characters, `A-Za-z0-9-_`). Forms the
     * trailing segment of the chat configuration ARN.
     *
     * Changing the name replaces the configuration.
     * @default ${app}-${stage}-${id}
     */
    configurationName?: string;
    /**
     * ID of the Microsoft Teams team authorized with AWS Chatbot. The team
     * must first be onboarded via the AWS Chatbot console OAuth flow — this
     * cannot be automated.
     *
     * Changing the team replaces the configuration.
     */
    teamId: string;
    /**
     * ID of the Microsoft Teams tenant.
     *
     * Changing the tenant replaces the configuration.
     */
    tenantId: string;
    /**
     * ID of the Microsoft Teams channel.
     */
    teamsChannelId: string;
    /**
     * Name of the Microsoft Teams channel. Informational only.
     */
    teamsChannelName?: string;
    /**
     * Name of the Microsoft Teams team. Informational only.
     */
    teamName?: string;
    /**
     * ARN of the IAM role that defines the permissions for running commands
     * from this channel (the channel role). Must trust
     * `chatbot.amazonaws.com`.
     */
    iamRoleArn: string;
    /**
     * ARNs of the SNS topics that deliver notifications to this channel.
     */
    snsTopicArns?: string[];
    /**
     * Logging level for the configuration: `ERROR`, `INFO`, or `NONE`.
     * @default NONE
     */
    loggingLevel?: "ERROR" | "INFO" | "NONE";
    /**
     * ARNs of the IAM managed policies applied as channel guardrails. The AWS
     * managed `AdministratorAccess` policy is applied by default if this is
     * not set.
     */
    guardrailPolicyArns?: string[];
    /**
     * Whether channel members must have their AWS user identities authorized
     * before running commands.
     * @default false
     */
    userAuthorizationRequired?: boolean;
    /**
     * Tags to apply to the configuration. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface MicrosoftTeamsChannelConfiguration extends Resource<"AWS.Chatbot.MicrosoftTeamsChannelConfiguration", MicrosoftTeamsChannelConfigurationProps, {
    /**
     * Name of the channel configuration.
     */
    configurationName: string;
    /**
     * The ARN of the channel configuration.
     */
    chatConfigurationArn: string;
    /**
     * The Microsoft Teams team ID.
     */
    teamId: string;
    /**
     * The Microsoft Entra (Azure AD) tenant ID.
     */
    tenantId: string;
    /**
     * The Microsoft Teams channel ID.
     */
    teamsChannelId: string;
    /**
     * Current state of the configuration (e.g. `ENABLED`).
     */
    state: string | undefined;
}, never, Providers> {
}
/**
 * An AWS Chatbot (Amazon Q Developer in chat applications) Microsoft Teams
 * channel configuration that delivers SNS notifications to a Teams channel
 * and lets channel members run read-only or scoped AWS commands.
 *
 * The Microsoft Teams team must be onboarded to AWS Chatbot beforehand via
 * the console OAuth flow (Chatbot console -> Configure new client ->
 * Microsoft Teams) — team authorization cannot be automated.
 *
 * ### Creating Microsoft Teams Channel Configurations
 * **Example:** Notify a Teams channel from an SNS topic
 * ```typescript
 * import * as Chatbot from "alchemy/AWS/Chatbot";
 * import { Role } from "alchemy/AWS/IAM/Role";
 * import * as SNS from "alchemy/AWS/SNS";
 *
 * const topic = yield* SNS.Topic("Alerts", {});
 * const role = yield* Role("ChatbotRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { Service: "chatbot.amazonaws.com" },
 *         Action: ["sts:AssumeRole"],
 *       },
 *     ],
 *   },
 *   managedPolicyArns: ["arn:aws:iam::aws:policy/ReadOnlyAccess"],
 * });
 *
 * const config = yield* Chatbot.MicrosoftTeamsChannelConfiguration("Alerts", {
 *   teamId: "0a1b2c3d-4e5f-1a2b-3c4d-0a1b2c3d4e5f",
 *   tenantId: "1a2b3c4d-5e6f-1a2b-3c4d-1a2b3c4d5e6f",
 *   teamsChannelId: "19%3ab6ef35dc342d56ba5654e6fc6d25a071%40thread.tacv2",
 *   iamRoleArn: role.roleArn,
 *   snsTopicArns: [topic.topicArn],
 * });
 * ```
 *
 * @resource
 */
export declare const MicrosoftTeamsChannelConfiguration: import("../../Resource.ts").ResourceClass<MicrosoftTeamsChannelConfiguration>;
export declare const MicrosoftTeamsChannelConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<MicrosoftTeamsChannelConfiguration>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=MicrosoftTeamsChannelConfiguration.d.ts.map