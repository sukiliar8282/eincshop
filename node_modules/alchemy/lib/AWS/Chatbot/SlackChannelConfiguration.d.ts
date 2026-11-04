import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface SlackChannelConfigurationProps {
    /**
     * Name of the configuration (1-128 characters, `A-Za-z0-9-_`). Forms the
     * trailing segment of the chat configuration ARN.
     *
     * Changing the name replaces the configuration.
     * @default ${app}-${stage}-${id}
     */
    configurationName?: string;
    /**
     * ID of the Slack workspace (team) authorized with AWS Chatbot, e.g.
     * `T012ABCDEFG`. The workspace must first be onboarded via the AWS Chatbot
     * console OAuth flow — this cannot be automated.
     *
     * Changing the workspace replaces the configuration.
     */
    slackTeamId: string;
    /**
     * ID of the Slack channel, e.g. `C012AB3CD`. In Slack, copy it from the
     * channel details or the channel URL.
     */
    slackChannelId: string;
    /**
     * Name of the Slack channel. Informational only.
     */
    slackChannelName?: string;
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
export interface SlackChannelConfiguration extends Resource<"AWS.Chatbot.SlackChannelConfiguration", SlackChannelConfigurationProps, {
    /**
     * Name of the channel configuration.
     */
    configurationName: string;
    /**
     * The ARN of the channel configuration.
     */
    chatConfigurationArn: string;
    /**
     * The Slack workspace (team) ID.
     */
    slackTeamId: string;
    /**
     * The Slack channel ID.
     */
    slackChannelId: string;
    /**
     * Name of the Slack workspace.
     */
    slackTeamName: string;
    /**
     * Current state of the configuration (e.g. `ENABLED`).
     */
    state: string | undefined;
}, never, Providers> {
}
/**
 * An AWS Chatbot (Amazon Q Developer in chat applications) Slack channel
 * configuration that delivers SNS notifications to a Slack channel and lets
 * channel members run read-only or scoped AWS commands.
 *
 * The Slack workspace must be onboarded to AWS Chatbot beforehand via the
 * console OAuth flow (Chatbot console -> Configure new client -> Slack) —
 * workspace authorization cannot be automated.
 *
 * ### Creating Slack Channel Configurations
 * **Example:** Notify a Slack channel from an SNS topic
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
 * const config = yield* Chatbot.SlackChannelConfiguration("Alerts", {
 *   slackTeamId: "T012ABCDEFG",
 *   slackChannelId: "C012AB3CD",
 *   iamRoleArn: role.roleArn,
 *   snsTopicArns: [topic.topicArn],
 *   loggingLevel: "ERROR",
 * });
 * ```
 *
 * @resource
 */
export declare const SlackChannelConfiguration: import("../../Resource.ts").ResourceClass<SlackChannelConfiguration>;
export declare const SlackChannelConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<SlackChannelConfiguration>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=SlackChannelConfiguration.d.ts.map