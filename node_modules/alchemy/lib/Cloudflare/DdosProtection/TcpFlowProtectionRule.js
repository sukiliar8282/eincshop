import * as ddos from "@distilled.cloud/cloudflare/ddos-protection";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.DdosProtection.TcpFlowProtectionRule";
/**
 * An Advanced TCP Protection out-of-state TCP flow rule (Magic Transit).
 *
 * Rules tune how Cloudflare mitigates out-of-state TCP packet floods (ACK,
 * RST, …) on Magic Transit prefixes, per scope (`global`, a region, or a
 * data center). The rule's identity is its `scope` + `name` pair — only
 * `mode` and the sensitivities are mutable in place.
 *
 * Requires the **Magic Transit / Advanced TCP Protection** entitlement; on
 * accounts without it every API call fails with the typed
 * `AdvancedTcpProtectionNotEntitled` error.
 *
 * Safety: rules carry no ownership markers. When there is no prior state,
 * `read` scans for an existing rule with the same scope + name and reports
 * it as `Unowned`, so the engine refuses to take it over unless `--adopt`
 * (or `adopt(true)`) is set.
 * ### Creating a rule
 * **Example:** Global TCP flow protection in monitoring mode
 * ```typescript
 * const rule = yield* Cloudflare.DdosProtection.TcpFlowProtectionRule("GlobalFlow", {
 *   scope: "global",
 *   mode: "monitoring",
 *   burstSensitivity: "medium",
 *   rateSensitivity: "medium",
 * });
 * ```
 *
 * **Example:** Region-scoped rule
 * ```typescript
 * yield* Cloudflare.DdosProtection.TcpFlowProtectionRule("WeurFlow", {
 *   scope: "region",
 *   name: "WEUR",
 *   mode: "enabled",
 *   burstSensitivity: "high",
 *   rateSensitivity: "low",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/ddos-protection/advanced-ddos-systems/overview/advanced-tcp-protection/
 *
 * @resource
 * @product DDoS Protection
 * @category Network
 */
export const TcpFlowProtectionRule = Resource(TypeId);
/**
 * Returns true if the given value is a TcpFlowProtectionRule resource.
 */
export const isTcpFlowProtectionRule = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const TcpFlowProtectionRuleProvider = () => Provider.succeed(TcpFlowProtectionRule, {
    stables: ["ruleId", "accountId", "scope", "name", "createdOn"],
    diff: Effect.fn(function* ({ olds, news }) {
        if (olds === undefined)
            return undefined;
        // `news` runs at plan time and may still carry unresolved
        // expressions — bail out and let the engine apply default logic.
        if (!isResolved(news))
            return undefined;
        // The API only patches mode/sensitivities — the scope + name pair is
        // the rule's identity and cannot change.
        if (olds.scope !== news.scope || ruleName(olds) !== ruleName(news)) {
            return { action: "replace" };
        }
        return undefined;
    }),
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* ddos.listAdvancedTcpProtectionTcpFlowProtectionRules
            .pages({ accountId })
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((rule) => toAttributes(rule, accountId)))), 
        // Accounts lacking the Advanced TCP Protection entitlement (or a
        // token without access) can't enumerate rules — there is nothing
        // to nuke, so report an empty set rather than failing.
        Effect.catchTags({
            AdvancedTcpProtectionNotEntitled: () => Effect.succeed([]),
            Forbidden: () => Effect.succeed([]),
        }));
    }),
    read: Effect.fn(function* ({ output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        // Owned path: refresh by our persisted rule id.
        if (output?.ruleId) {
            const observed = yield* getRule(acct, output.ruleId);
            if (observed)
                return toAttributes(observed, acct);
        }
        // Adoption path: a rule for this scope + name may already exist.
        // Rules carry no ownership markers, so brand the match `Unowned` —
        // the engine refuses to take over unless `adopt` is set.
        const identity = output ?? olds;
        if (identity?.scope) {
            const observed = yield* findByScopeAndName(acct, identity.scope, ruleName(identity));
            if (observed)
                return Unowned(toAttributes(observed, acct));
        }
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const name = ruleName(news);
        // 1. Observe — the rule id cached on `output` is a hint, not a
        //    guarantee: a missing rule falls through to the scope + name
        //    scan and then to create.
        let observed = output?.ruleId
            ? yield* getRule(accountId, output.ruleId)
            : undefined;
        // 2. Fall back to scanning for the scope + name match (ownership was
        //    already gated by `read` reporting existing rules as Unowned).
        if (!observed) {
            observed = yield* findByScopeAndName(accountId, news.scope, name);
        }
        // 3. Ensure — create when missing.
        if (!observed) {
            observed = yield* ddos.createAdvancedTcpProtectionTcpFlowProtectionRule({
                accountId,
                scope: news.scope,
                name,
                mode: news.mode,
                burstSensitivity: news.burstSensitivity,
                rateSensitivity: news.rateSensitivity,
            });
        }
        // 4. Sync — diff observed mutable aspects against desired; skip the
        //    patch entirely on a no-op.
        const dirty = observed.mode !== news.mode ||
            observed.burstSensitivity !== news.burstSensitivity ||
            observed.rateSensitivity !== news.rateSensitivity;
        if (dirty) {
            observed =
                yield* ddos.patchAdvancedTcpProtectionTcpFlowProtectionRuleItem({
                    accountId,
                    ruleId: observed.id,
                    mode: news.mode,
                    burstSensitivity: news.burstSensitivity,
                    rateSensitivity: news.rateSensitivity,
                });
        }
        return toAttributes(observed, accountId);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* ddos
            .deleteAdvancedTcpProtectionTcpFlowProtectionRuleItem({
            accountId: output.accountId,
            ruleId: output.ruleId,
        })
            .pipe(Effect.catchTag("TcpFlowProtectionRuleNotFound", () => Effect.void));
    }),
});
const ruleName = (props) => props.name ?? "global";
/**
 * Read a rule by id, mapping "gone" (`TcpFlowProtectionRuleNotFound`,
 * HTTP 404) to `undefined`.
 */
const getRule = (accountId, ruleId) => ddos
    .getAdvancedTcpProtectionTcpFlowProtectionRuleItem({ accountId, ruleId })
    .pipe(Effect.map((rule) => rule), Effect.catchTag("TcpFlowProtectionRuleNotFound", () => Effect.succeed(undefined)));
/**
 * Find a rule by its scope + name identity. If several rules carry the same
 * pair, pick the oldest for determinism.
 */
const findByScopeAndName = (accountId, scope, name) => ddos.listAdvancedTcpProtectionTcpFlowProtectionRules
    .items({ accountId })
    .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
    .filter((rule) => rule.scope === scope && rule.name === name)
    .sort((a, b) => a.createdOn.localeCompare(b.createdOn))
    .at(0)));
const toAttributes = (rule, accountId) => ({
    ruleId: rule.id,
    accountId,
    // Distilled widens generated string enums to plain strings.
    scope: rule.scope,
    name: rule.name,
    mode: rule.mode,
    burstSensitivity: rule.burstSensitivity,
    rateSensitivity: rule.rateSensitivity,
    createdOn: rule.createdOn,
    modifiedOn: rule.modifiedOn,
});
//# sourceMappingURL=TcpFlowProtectionRule.js.map