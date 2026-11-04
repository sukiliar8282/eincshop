import * as mm from "@distilled.cloud/aws/mailmanager";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface RuleSetProps {
    /**
     * Name of the rule set. If omitted, a deterministic physical name is
     * generated from the app, stage, and logical ID. Renames apply in place.
     */
    ruleSetName?: string;
    /**
     * The ordered list of rules evaluated against emails arriving through an
     * ingress point associated with this rule set. Each rule pairs optional
     * conditions with one or more actions (Drop, Relay, Archive, WriteToS3,
     * Send, AddHeader, ReplaceRecipient, DeliverToMailbox, DeliverToQBusiness,
     * PublishToSns, Bounce, InvokeLambda). Updates apply in place.
     * @default []
     */
    rules?: mm.Rule[];
    /**
     * Tags applied to the rule set. Alchemy ownership tags are merged in
     * automatically.
     */
    tags?: Record<string, string>;
}
export interface RuleSet extends Resource<"AWS.MailManager.RuleSet", RuleSetProps, {
    /** Server-assigned ID of the rule set. */
    ruleSetId: string;
    /** ARN of the rule set. */
    ruleSetArn: string;
    /** Name of the rule set. */
    ruleSetName: string;
}, never, Providers> {
}
/**
 * An SES Mail Manager rule set — the ordered rules an ingress point applies
 * to incoming email (drop, archive, write to S3, deliver, bounce, invoke
 * Lambda, ...).
 *
 * All aspects (name, rules, tags) update in place.
 * ### Creating Rule Sets
 * **Example:** Drop Everything
 * ```typescript
 * import * as MailManager from "alchemy/AWS/MailManager";
 *
 * const ruleSet = yield* MailManager.RuleSet("Inbound", {
 *   rules: [{ Name: "DropAll", Actions: [{ Drop: {} }] }],
 * });
 * ```
 *
 * **Example:** Conditional Archive
 * ```typescript
 * const ruleSet = yield* MailManager.RuleSet("Inbound", {
 *   rules: [
 *     {
 *       Name: "ArchiveLarge",
 *       Conditions: [
 *         {
 *           NumberExpression: {
 *             Evaluate: { Attribute: "MESSAGE_SIZE" },
 *             Operator: "GREATER_THAN",
 *             Value: 1024,
 *           },
 *         },
 *       ],
 *       Actions: [{ Archive: { TargetArchive: archive.archiveId } }],
 *     },
 *   ],
 * });
 * ```
 *
 * ### Wiring to an Ingress Point
 * **Example:** Rule Set + Traffic Policy + Ingress Point
 * ```typescript
 * const ingress = yield* MailManager.IngressPoint("Smtp", {
 *   type: "OPEN",
 *   ruleSetId: ruleSet.ruleSetId,
 *   trafficPolicyId: trafficPolicy.trafficPolicyId,
 * });
 * ```
 *
 * ### Delivering Email Events to Compute
 * **Example:** Invoke a Lambda for Matching Mail
 * ```typescript
 * // Mail Manager has no EventBridge events or event-source mapping — email
 * // events reach compute through rule actions: InvokeLambda (direct),
 * // PublishToSns (SNS event source), or WriteToS3 (S3 event source). The
 * // role must be assumable by ses.amazonaws.com with lambda:InvokeFunction.
 * const ruleSet = yield* MailManager.RuleSet("Inbound", {
 *   rules: [
 *     {
 *       Name: "NotifyOnMail",
 *       Actions: [
 *         {
 *           InvokeLambda: {
 *             FunctionArn: fn.functionArn,
 *             InvocationType: "EVENT",
 *             RoleArn: invokeRole.roleArn,
 *           },
 *         },
 *       ],
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const RuleSet: import("../../Resource.ts").ResourceClass<RuleSet>;
export declare const RuleSetProvider: () => import("effect/Layer").Layer<Provider.Provider<RuleSet>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=RuleSet.d.ts.map