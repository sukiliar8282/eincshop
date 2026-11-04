import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * A criteria block controlling when a custom action button is shown on a
 * notification.
 */
export interface CustomActionAttachmentCriteria {
    /**
     * The operation to perform on the named variable: `HAS_VALUE` or `EQUALS`.
     */
    operator: "HAS_VALUE" | "EQUALS" | (string & {});
    /**
     * The name of the notification variable to operate on.
     */
    variableName: string;
    /**
     * The value to compare the variable against when the operator is `EQUALS`.
     */
    value?: string;
}
/**
 * Defines when and how a custom action surfaces as a button on chat
 * notifications.
 */
export interface CustomActionAttachment {
    /**
     * The type of notification the action button appears on, e.g.
     * `CloudWatch`. Although the AWS API documentation marks this optional,
     * the live API rejects attachments without it (`Invalid request body`).
     */
    notificationType: string;
    /**
     * The label of the button that appears on the notification.
     */
    buttonText?: string;
    /**
     * Conditions (over notification variables) that must be met for the button
     * to appear.
     */
    criteria?: CustomActionAttachmentCriteria[];
    /**
     * Variable values bound into the action's command text.
     */
    variables?: Record<string, string>;
}
export interface CustomActionProps {
    /**
     * Name of the custom action (1-64 characters, `A-Za-z0-9-_`). Forms the
     * trailing segment of the custom action ARN.
     *
     * Changing the name replaces the custom action.
     * @default ${app}-${stage}-${id}
     */
    actionName?: string;
    /**
     * The CLI command text executed when the action is invoked, e.g.
     * `aws lambda list-functions`. Variables from attachments may be
     * interpolated with `$variable` syntax.
     */
    commandText: string;
    /**
     * An alias that lets chat users invoke the action as `@aws run <alias>`.
     */
    aliasName?: string;
    /**
     * Notification attachments that surface the action as a button on
     * matching notifications.
     */
    attachments?: CustomActionAttachment[];
    /**
     * Tags to apply to the custom action. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface CustomAction extends Resource<"AWS.Chatbot.CustomAction", CustomActionProps, {
    /**
     * Name of the custom action.
     */
    actionName: string;
    /**
     * The ARN of the custom action.
     */
    customActionArn: string;
}, never, Providers> {
}
/**
 * An AWS Chatbot (Amazon Q Developer in chat applications) custom action —
 * a reusable CLI command that chat users invoke by alias or as a button on
 * notifications.
 *
 * Custom actions exist at the account level and do not require a chat
 * workspace to be onboarded, though they only become usable once a Slack or
 * Microsoft Teams channel configuration exists.
 *
 * ### Creating Custom Actions
 * **Example:** List Lambda functions from chat
 * ```typescript
 * import * as Chatbot from "alchemy/AWS/Chatbot";
 *
 * const action = yield* Chatbot.CustomAction("ListFunctions", {
 *   commandText: "aws lambda list-functions",
 *   aliasName: "list-functions",
 * });
 * ```
 *
 * **Example:** Button on CloudWatch alarm notifications
 * ```typescript
 * const action = yield* Chatbot.CustomAction("DescribeAlarm", {
 *   commandText: "aws cloudwatch describe-alarms --alarm-names $AlarmName",
 *   attachments: [
 *     {
 *       notificationType: "CloudWatch",
 *       buttonText: "Describe alarm",
 *       criteria: [
 *         { operator: "HAS_VALUE", variableName: "AlarmName" },
 *       ],
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const CustomAction: import("../../Resource.ts").ResourceClass<CustomAction>;
export declare const CustomActionProvider: () => import("effect/Layer").Layer<Provider.Provider<CustomAction>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=CustomAction.d.ts.map