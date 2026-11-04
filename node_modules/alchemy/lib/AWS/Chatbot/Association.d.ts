import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
declare const AssociationNotVisible_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "AssociationNotVisible";
} & Readonly<A>;
/**
 * Raised when a freshly created Chatbot association has not become visible
 * to `listAssociations` within the bounded eventual-consistency window.
 */
export declare class AssociationNotVisible extends AssociationNotVisible_base<{
    readonly chatConfiguration: string;
    readonly resource: string;
}> {
}
export interface AssociationProps {
    /**
     * ARN of the Slack or Microsoft Teams channel configuration to associate
     * the resource with (e.g.
     * `arn:aws:chatbot::123456789012:chat-configuration/slack-channel/alerts`).
     *
     * Changing the configuration replaces the association.
     */
    chatConfiguration: string;
    /**
     * ARN of the resource to associate with the channel configuration — a
     * Chatbot custom action ARN (e.g.
     * `arn:aws:chatbot::123456789012:custom-action/describe-alarm`).
     *
     * Changing the resource replaces the association.
     */
    resource: string;
}
export interface Association extends Resource<"AWS.Chatbot.Association", AssociationProps, {
    /**
     * ARN of the channel configuration the resource is associated with.
     */
    chatConfigurationArn: string;
    /**
     * ARN of the associated resource (the custom action).
     */
    resourceArn: string;
}, never, Providers> {
}
/**
 * An AWS Chatbot (Amazon Q Developer in chat applications) association that
 * links a resource — a {@link CustomAction} — to a Slack or Microsoft Teams
 * channel configuration so the action is available in that channel.
 *
 * ### Associating Custom Actions
 * **Example:** Attach a custom action to a Slack channel configuration
 * ```typescript
 * import * as Chatbot from "alchemy/AWS/Chatbot";
 *
 * const action = yield* Chatbot.CustomAction("DescribeAlarm", {
 *   commandText: "aws cloudwatch describe-alarms --alarm-names $AlarmName",
 * });
 *
 * const config = yield* Chatbot.SlackChannelConfiguration("Alerts", {
 *   slackTeamId: "T012ABCDEFG",
 *   slackChannelId: "C012AB3CD",
 *   iamRoleArn: role.roleArn,
 * });
 *
 * const association = yield* Chatbot.Association("AlarmAction", {
 *   chatConfiguration: config.chatConfigurationArn,
 *   resource: action.customActionArn,
 * });
 * ```
 *
 * @resource
 */
export declare const Association: import("../../Resource.ts").ResourceClass<Association>;
export declare const AssociationProvider: () => import("effect/Layer").Layer<Provider.Provider<Association>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
export {};
//# sourceMappingURL=Association.d.ts.map