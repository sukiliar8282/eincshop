import * as ses from "@distilled.cloud/aws/ses";
import * as Effect from "effect/Effect";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
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
export const ReceiptRule = Resource("AWS.SES.ReceiptRule");
/**
 * The name of the rule immediately preceding `ruleName` in the rule set's
 * ordered rule list, or `undefined` when the rule is first (or absent). This is
 * the observed value of the `after` position.
 */
const observedPredecessor = (rules, ruleName) => {
    const index = rules.findIndex((rule) => rule.Name === ruleName);
    if (index <= 0)
        return undefined;
    return rules[index - 1]?.Name;
};
export const ReceiptRuleProvider = () => Provider.effect(ReceiptRule, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.ruleName ?? (yield* createPhysicalName({ id, maxLength: 64 })));
    });
    const describeRule = Effect.fn(function* (ruleSetName, ruleName) {
        return yield* ses
            .describeReceiptRule({ RuleSetName: ruleSetName, RuleName: ruleName })
            .pipe(Effect.catchTags({
            RuleDoesNotExistException: () => Effect.succeed(undefined),
            RuleSetDoesNotExistException: () => Effect.succeed(undefined),
        }));
    });
    const buildRule = (ruleName, props) => ({
        Name: ruleName,
        // The classic API defaults an omitted Enabled/ScanEnabled to FALSE —
        // apply the documented defaults explicitly so an undeclared rule is
        // enabled (a silently disabled rule bounces all inbound mail).
        Enabled: props.enabled ?? true,
        TlsPolicy: props.tlsPolicy,
        Recipients: props.recipients,
        Actions: props.actions,
        ScanEnabled: props.scanEnabled ?? true,
    });
    return ReceiptRule.Provider.of({
        stables: ["ruleSetName", "ruleName"],
        // Rules are sub-resources keyed entirely by their parent rule set;
        // there is no flat account-level enumeration, so nuke handles them via
        // the parent rule set's deletion.
        list: () => Effect.succeed([]),
        read: Effect.fn(function* ({ id, olds, output }) {
            const ruleSetName = output?.ruleSetName ?? olds.ruleSetName;
            if (!ruleSetName)
                return undefined;
            const ruleName = output?.ruleName ?? (yield* createName(id, olds));
            const found = yield* describeRule(ruleSetName, ruleName);
            return found?.Rule ? { ruleSetName, ruleName } : undefined;
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            if (news.ruleSetName !== olds.ruleSetName) {
                return { action: "replace" };
            }
            const oldName = yield* createName(id, olds);
            const newName = yield* createName(id, news);
            if (oldName !== newName) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output }) {
            const ruleSetName = news.ruleSetName;
            const ruleName = output?.ruleName ?? (yield* createName(id, news));
            const rule = buildRule(ruleName, news);
            // OBSERVE — cloud state is authoritative.
            const observed = yield* describeRule(ruleSetName, ruleName);
            // ENSURE / SYNC — a single full-replace call converges the rule's
            // matcher and actions whether it is missing or already present.
            if (observed?.Rule === undefined) {
                yield* ses
                    .createReceiptRule({
                    RuleSetName: ruleSetName,
                    After: news.after,
                    Rule: rule,
                })
                    .pipe(Effect.catchTag("AlreadyExistsException", () => ses.updateReceiptRule({
                    RuleSetName: ruleSetName,
                    Rule: rule,
                })));
            }
            else {
                yield* ses.updateReceiptRule({
                    RuleSetName: ruleSetName,
                    Rule: rule,
                });
            }
            // SYNC POSITION — updateReceiptRule never moves the rule, so diff the
            // observed predecessor against the desired `after` and reposition
            // only on a mismatch.
            const ruleSet = yield* ses.describeReceiptRuleSet({
                RuleSetName: ruleSetName,
            });
            const predecessor = observedPredecessor(ruleSet.Rules ?? [], ruleName);
            if (predecessor !== news.after) {
                yield* ses.setReceiptRulePosition({
                    RuleSetName: ruleSetName,
                    RuleName: ruleName,
                    After: news.after,
                });
            }
            return { ruleSetName, ruleName };
        }),
        delete: Effect.fn(function* ({ output }) {
            // deleteReceiptRule is idempotent for a missing rule; a missing rule
            // set means the rule is already gone.
            yield* ses
                .deleteReceiptRule({
                RuleSetName: output.ruleSetName,
                RuleName: output.ruleName,
            })
                .pipe(Effect.catchTag("RuleSetDoesNotExistException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=ReceiptRule.js.map