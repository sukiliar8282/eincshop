import * as ses from "@distilled.cloud/aws/ses";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * Whether SES requires (`Require`) or merely prefers (`Optional`) a TLS
 * connection from the sending mail server before accepting a message that
 * matches this rule.
 */
export type ReceiptRuleTlsPolicy = ses.TlsPolicy;
/**
 * A single receipt-rule action. Pass the distilled action shape directly — one
 * of `S3Action`, `SNSAction`, `LambdaAction`, `BounceAction`, `AddHeaderAction`,
 * `StopAction`, `WorkmailAction`, or `ConnectAction`. Actions run in array
 * order; resource ARNs (bucket, topic, function) are supplied by the caller.
 */
export type ReceiptRuleAction = ses.ReceiptAction;
export interface ReceiptRuleProps {
    /**
     * Name of the receipt rule set this rule belongs to. Typically the
     * `ruleSetName` output of a `SES.ReceiptRuleSet`. Changing it replaces the
     * rule.
     */
    ruleSetName: string;
    /**
     * Name of the receipt rule. May contain letters, numbers, dashes,
     * underscores and periods, up to 64 characters. If omitted, a deterministic
     * physical name is generated from the app, stage, and logical ID. Changing
     * the name replaces the rule.
     */
    ruleName?: string;
    /**
     * Whether the rule is enabled. Disabled rules are skipped during receipt
     * processing.
     * @default true
     */
    enabled?: boolean;
    /**
     * Whether SES scans incoming messages that match this rule for spam and
     * viruses.
     * @default true
     */
    scanEnabled?: boolean;
    /**
     * Whether SES accepts email over a clear text connection (`Optional`) or
     * requires TLS (`Require`) before applying this rule.
     * @default "Optional"
     */
    tlsPolicy?: ReceiptRuleTlsPolicy;
    /**
     * Recipient email addresses or domains this rule applies to. An empty or
     * omitted list matches all recipients.
     */
    recipients?: string[];
    /**
     * Name of an existing rule in the same rule set after which this rule should
     * be placed. Omit to place the rule at the top of the rule set. Rules are
     * evaluated in order.
     */
    after?: string;
    /**
     * Ordered list of actions SES performs when a message matches this rule
     * (deliver to S3, publish to SNS, invoke Lambda, bounce, add a header, stop
     * processing, etc.).
     */
    actions?: ReceiptRuleAction[];
}
export interface ReceiptRule extends Resource<"AWS.SES.ReceiptRule", ReceiptRuleProps, {
    /** Name of the rule set this rule belongs to. */
    ruleSetName: string;
    /** Name of the receipt rule. */
    ruleName: string;
}, never, Providers> {
}
/**
 * An Amazon SES receipt rule — a matcher plus an ordered list of actions that
 * SES applies to inbound email received through the parent
 * `SES.ReceiptRuleSet`.
 *
 * Actions are passed as the raw distilled action shapes (no marshalling): the
 * caller supplies bucket names, topic ARNs, and function ARNs directly.
 * ### Creating Rules
 * **Example:** Deliver Matching Mail to S3
 * ```typescript
 * import * as SES from "alchemy/AWS/SES";
 *
 * const ruleSet = yield* SES.ReceiptRuleSet("Inbound", {});
 * const rule = yield* SES.ReceiptRule("ToBucket", {
 *   ruleSetName: ruleSet.ruleSetName,
 *   recipients: ["support@example.com"],
 *   actions: [
 *     { S3Action: { BucketName: "my-inbound-mail" } },
 *   ],
 * });
 * ```
 *
 * **Example:** Invoke a Lambda and Add a Header
 * ```typescript
 * const rule = yield* SES.ReceiptRule("Process", {
 *   ruleSetName: ruleSet.ruleSetName,
 *   tlsPolicy: "Require",
 *   scanEnabled: true,
 *   actions: [
 *     { AddHeaderAction: { HeaderName: "X-Inbound", HeaderValue: "ses" } },
 *     { LambdaAction: { FunctionArn: fn.functionArn, InvocationType: "Event" } },
 *   ],
 * });
 * ```
 *
 * ### Ordering Rules
 * **Example:** Place a Rule After Another
 * ```typescript
 * // A BounceAction's Sender must be a verified SES identity — SES rejects the
 * // rule with IdentityNotVerified at create/update time otherwise.
 * const first = yield* SES.ReceiptRule("First", {
 *   ruleSetName: ruleSet.ruleSetName,
 *   actions: [{ StopAction: { Scope: "RuleSet" } }],
 * });
 * const second = yield* SES.ReceiptRule("Second", {
 *   ruleSetName: ruleSet.ruleSetName,
 *   after: first.ruleName,
 *   actions: [{ BounceAction: {
 *     SmtpReplyCode: "550",
 *     Message: "Mailbox does not exist",
 *     Sender: "mailer-daemon@example.com",
 *   } }],
 * });
 * ```
 *
 * @resource
 */
export declare const ReceiptRule: import("../../Resource.ts").ResourceClass<ReceiptRule>;
export declare const ReceiptRuleProvider: () => import("effect/Layer").Layer<Provider.Provider<ReceiptRule>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ReceiptRule.d.ts.map