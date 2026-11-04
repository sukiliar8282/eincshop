import * as ses from "@distilled.cloud/aws/ses";
import * as Effect from "effect/Effect";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * An Amazon SES receipt rule set — the ordered container for the receipt rules
 * that decide what happens to inbound email (deliver to S3, invoke a Lambda,
 * publish to SNS, bounce, etc.).
 *
 * A rule set is an empty container on creation; add `SES.ReceiptRule`s to it
 * and point the account at it with `SES.ActiveReceiptRuleSet` to start
 * processing mail. Email receiving is only available in a subset of regions
 * (e.g. `us-east-1`, `us-west-2`, `eu-west-1`).
 * ### Creating Rule Sets
 * **Example:** Basic Rule Set
 * ```typescript
 * import * as SES from "alchemy/AWS/SES";
 *
 * const ruleSet = yield* SES.ReceiptRuleSet("Inbound", {});
 * ```
 *
 * **Example:** Named Rule Set
 * ```typescript
 * const ruleSet = yield* SES.ReceiptRuleSet("Inbound", {
 *   ruleSetName: "my-inbound-rules",
 * });
 * ```
 *
 * ### Activating a Rule Set
 * **Example:** Point the Account at a Rule Set
 * ```typescript
 * const ruleSet = yield* SES.ReceiptRuleSet("Inbound", {});
 * yield* SES.ActiveReceiptRuleSet("Active", {
 *   ruleSetName: ruleSet.ruleSetName,
 * });
 * ```
 *
 * @resource
 */
export const ReceiptRuleSet = Resource("AWS.SES.ReceiptRuleSet");
export const ReceiptRuleSetProvider = () => Provider.effect(ReceiptRuleSet, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.ruleSetName ??
            (yield* createPhysicalName({ id, maxLength: 64 })));
    });
    const describe = Effect.fn(function* (name) {
        return yield* ses
            .describeReceiptRuleSet({ RuleSetName: name })
            .pipe(Effect.catchTag("RuleSetDoesNotExistException", () => Effect.succeed(undefined)));
    });
    return ReceiptRuleSet.Provider.of({
        stables: ["ruleSetName"],
        // Account/region-scoped: enumerate every rule set so leaked test
        // resources are cleaned by nuke. Classic receipt rule sets carry no
        // tags, so there is no ownership signal to filter on.
        list: () => Effect.gen(function* () {
            const rows = [];
            let nextToken;
            do {
                const page = yield* ses.listReceiptRuleSets({
                    NextToken: nextToken,
                });
                for (const set of page.RuleSets ?? []) {
                    if (set.Name)
                        rows.push({ ruleSetName: set.Name });
                }
                nextToken = page.NextToken;
            } while (nextToken);
            return rows;
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.ruleSetName ?? (yield* createName(id, olds));
            const found = yield* describe(name);
            // Receipt rule sets are untagged in the classic API, so there is no
            // way to distinguish a foreign rule set from one we own. Existence
            // at our deterministic name is treated as ownership.
            return found ? { ruleSetName: name } : undefined;
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds);
            const newName = yield* createName(id, news);
            if (oldName !== newName) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output }) {
            const name = output?.ruleSetName ?? (yield* createName(id, news));
            // OBSERVE — cloud state is authoritative.
            const observed = yield* describe(name);
            // ENSURE — create if missing; AlreadyExists is a race, not a failure.
            if (observed === undefined) {
                yield* ses
                    .createReceiptRuleSet({ RuleSetName: name })
                    .pipe(Effect.catchTag("AlreadyExistsException", () => Effect.succeed({})));
            }
            // A rule set has no mutable aspects of its own; rules are separate
            // `SES.ReceiptRule` resources.
            return { ruleSetName: name };
        }),
        delete: Effect.fn(function* ({ output }) {
            // deleteReceiptRuleSet is idempotent for a missing set; the active
            // set cannot be deleted and surfaces as a typed CannotDeleteException.
            yield* ses.deleteReceiptRuleSet({
                RuleSetName: output.ruleSetName,
            });
        }),
    });
}));
//# sourceMappingURL=ReceiptRuleSet.js.map