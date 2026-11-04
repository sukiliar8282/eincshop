import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * Behaviour when stack creation fails.
 * - `ROLLBACK` (default) — roll the stack back and delete created resources.
 * - `DO_NOTHING` — leave created resources in place for inspection.
 * - `DELETE` — delete the stack and all created resources.
 */
export type OnFailure = "DO_NOTHING" | "ROLLBACK" | "DELETE";
export interface StackProps {
    /**
     * Name of the CloudFormation stack. Must be 1-128 characters, start with a
     * letter, and contain only letters, digits, and hyphens. If omitted, a
     * deterministic physical name is generated. Changing the name replaces the
     * stack.
     */
    stackName?: string;
    /**
     * The CloudFormation template as an inline JSON or YAML string. Mutually
     * exclusive with `templateURL`. Maximum 51,200 bytes — use `templateURL`
     * for larger templates.
     */
    templateBody?: string;
    /**
     * Location of a template stored in Amazon S3 (an `https://` URL to an S3
     * object). Mutually exclusive with `templateBody`.
     */
    templateURL?: string;
    /**
     * Input parameter values for the template, keyed by parameter name.
     */
    parameters?: Record<string, string>;
    /**
     * IAM capabilities the stack is allowed to acknowledge. Required when the
     * template creates IAM resources (`CAPABILITY_IAM` /
     * `CAPABILITY_NAMED_IAM`) or uses macros (`CAPABILITY_AUTO_EXPAND`).
     */
    capabilities?: Array<"CAPABILITY_IAM" | "CAPABILITY_NAMED_IAM" | "CAPABILITY_AUTO_EXPAND">;
    /**
     * ARN of an IAM role that CloudFormation assumes to create/update/delete
     * the stack's resources. Defaults to the credentials of the deploying
     * principal.
     */
    roleArn?: string;
    /**
     * SNS topic ARNs that receive stack event notifications.
     */
    notificationARNs?: string[];
    /**
     * Whether to disable rollback of the stack if creation fails.
     * @default false
     */
    disableRollback?: boolean;
    /**
     * Behaviour when stack creation fails. Applied only on create.
     * @default "ROLLBACK"
     */
    onFailure?: OnFailure;
    /**
     * Amount of time that can pass before the stack status becomes
     * `CREATE_FAILED` (e.g. `"30 minutes"` or `Duration.minutes(30)`; a bare
     * number is milliseconds). Converted to whole minutes on the wire.
     */
    timeout?: Duration.Input;
    /**
     * User-defined tags propagated to every resource in the stack.
     */
    tags?: Record<string, string>;
}
export interface Stack extends Resource<"AWS.CloudFormation.Stack", StackProps, {
    /**
     * Name of the stack.
     */
    stackName: string;
    /**
     * The unique stack ID (ARN).
     */
    stackId: string;
    /**
     * Current status of the stack (e.g. `CREATE_COMPLETE`, `UPDATE_COMPLETE`).
     */
    stackStatus: string;
    /** Template outputs keyed by output name. */
    outputs: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS CloudFormation stack — deploy an existing CloudFormation template
 * from Alchemy as an interop/escape hatch.
 *
 * Create and update are asynchronous: the provider submits the template and
 * then polls (bounded) until the stack reaches a terminal state, surfacing a
 * `CREATE_FAILED` / `ROLLBACK_COMPLETE` / `UPDATE_ROLLBACK_COMPLETE` status as
 * a typed error rather than hanging. An update whose template and parameters
 * are unchanged is a no-op (`No updates are to be performed`). Deletion waits
 * for `DELETE_COMPLETE`.
 * ### Deploying a Template
 * **Example:** Inline Template (SNS Topic)
 * ```typescript
 * const stack = yield* CloudFormation.Stack("Notifications", {
 *   templateBody: JSON.stringify({
 *     Resources: {
 *       Topic: { Type: "AWS::SNS::Topic", Properties: { DisplayName: "alerts" } },
 *     },
 *     Outputs: { TopicArn: { Value: { Ref: "Topic" } } },
 *   }),
 * });
 * // stack.outputs.TopicArn -> "arn:aws:sns:us-west-2:...:Notifications-Topic-..."
 * ```
 *
 * **Example:** Template with Parameters
 * ```typescript
 * const stack = yield* CloudFormation.Stack("Config", {
 *   templateBody: JSON.stringify({
 *     Parameters: { Value: { Type: "String" } },
 *     Resources: {
 *       Param: {
 *         Type: "AWS::SSM::Parameter",
 *         Properties: { Type: "String", Value: { Ref: "Value" } },
 *       },
 *     },
 *   }),
 *   parameters: { Value: "hello" },
 * });
 * ```
 *
 * ### IAM Templates
 * **Example:** Acknowledging Capabilities
 * ```typescript
 * const stack = yield* CloudFormation.Stack("Roles", {
 *   templateBody: iamTemplateJson,
 *   capabilities: ["CAPABILITY_NAMED_IAM"],
 * });
 * ```
 *
 * @resource
 */
export declare const Stack: import("../../Resource.ts").ResourceClass<Stack>;
export declare const StackProvider: () => import("effect/Layer").Layer<Provider.Provider<Stack>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Stack.d.ts.map