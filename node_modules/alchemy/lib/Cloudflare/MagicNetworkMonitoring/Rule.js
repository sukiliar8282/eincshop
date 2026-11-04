import * as mnm from "@distilled.cloud/cloudflare/magic-network-monitoring";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.MagicNetworkMonitoring.Rule";
/**
 * A Magic Network Monitoring (MNM) rule — alerts when traffic to a set of
 * IPv4 prefixes exceeds a static threshold (`threshold`), deviates from the
 * learned baseline (`zscore`), or matches advanced DDoS criteria
 * (`advanced_ddos`, Magic Transit only).
 *
 * Rules require the account's MNM configuration to exist first — pass the
 * Config resource's `accountId` output as this rule's `accountId` to
 * sequence the deployment. Rule names are unique per account; the rule
 * `type` is immutable and changing it triggers a replacement.
 * ### Threshold rules
 * **Example:** Alert when bandwidth exceeds 1 Mbps for 5 minutes
 * ```typescript
 * const config = yield* Cloudflare.MagicNetworkMonitoring.Config("Mnm", {
 *   name: "my-network",
 *   defaultSampling: 1,
 * });
 * yield* Cloudflare.MagicNetworkMonitoring.Rule("BandwidthAlert", {
 *   accountId: config.accountId,
 *   type: "threshold",
 *   prefixes: ["10.0.0.0/24"],
 *   bandwidthThreshold: 1_000_000,
 *   duration: "5m",
 * });
 * ```
 *
 * **Example:** Packet-rate alert
 * ```typescript
 * yield* Cloudflare.MagicNetworkMonitoring.Rule("PacketAlert", {
 *   accountId: config.accountId,
 *   type: "threshold",
 *   prefixes: ["10.0.1.0/24"],
 *   packetThreshold: 10_000,
 * });
 * ```
 *
 * ### Anomaly detection
 * **Example:** Zscore rule on bits
 * ```typescript
 * yield* Cloudflare.MagicNetworkMonitoring.Rule("AnomalyAlert", {
 *   accountId: config.accountId,
 *   type: "zscore",
 *   prefixes: ["10.0.2.0/24"],
 *   zscoreSensitivity: "medium",
 *   zscoreTarget: "bits",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/magic-network-monitoring/rules/
 *
 * @resource
 * @product Magic Network Monitoring
 * @category Network
 */
export const Rule = Resource(TypeId);
/**
 * Returns true if the given value is a Rule resource.
 */
export const isRule = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const RuleProvider = () => Provider.succeed(Rule, {
    stables: ["ruleId", "accountId"],
    diff: Effect.fn(function* ({ olds, news, output }) {
        if (!isResolved(news))
            return undefined;
        // The rule type is immutable — alerting semantics differ entirely.
        const oldType = output?.type ??
            (olds !== undefined && isResolved(olds) ? olds.type : undefined);
        if (oldType !== undefined && oldType !== news.type) {
            return { action: "replace" };
        }
        // accountId is Input<string>; compare only once both are concrete.
        const oldAccount = output?.accountId;
        if (oldAccount !== undefined &&
            typeof news.accountId === "string" &&
            oldAccount !== news.accountId) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ??
            (typeof olds?.accountId === "string" ? olds.accountId : accountId);
        // Owned path: refresh by our persisted rule id.
        if (output?.ruleId) {
            const observed = yield* getRule(acct, output.ruleId);
            if (observed)
                return toAttributes(observed, acct);
        }
        // Cold read: rule names are unique per account, so an exact name
        // match identifies the rule. We cannot prove we created it — brand
        // it `Unowned` so takeover is gated behind the adopt policy.
        const name = yield* createRuleName(id, olds?.name);
        const match = yield* findByName(acct, name);
        if (match) {
            const attributes = toAttributes(match, acct);
            return output === undefined ? Unowned(attributes) : attributes;
        }
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const { accountId: defaultAccountId } = yield* yield* CloudflareEnvironment;
        // Inputs have been resolved to concrete strings by Plan.
        const accountId = news.accountId ?? defaultAccountId;
        const name = yield* createRuleName(id, news.name);
        // 1. Observe — the rule id cached on `output` is a hint, not a
        //    guarantee: a missing rule falls through to the name scan and
        //    then to create.
        let observed = output?.ruleId
            ? yield* getRule(accountId, output.ruleId)
            : undefined;
        if (!observed) {
            observed = yield* findByName(accountId, name);
        }
        // 2. Ensure — create when missing. A concurrent create surfaces as
        //    `DuplicateMnmRuleName` (Cloudflare code 1008): converge by
        //    re-scanning for the rule that won the race.
        if (!observed) {
            observed = yield* mnm
                .createRule({
                accountId,
                name,
                type: news.type,
                prefixes: news.prefixes,
                automaticAdvertisement: news.automaticAdvertisement ?? false,
                bandwidthThreshold: news.bandwidthThreshold,
                packetThreshold: news.packetThreshold,
                duration: news.duration,
                zscoreSensitivity: news.zscoreSensitivity,
                zscoreTarget: news.zscoreTarget,
                prefixMatch: news.prefixMatch,
            })
                .pipe(
            // The account MNM config is a freshly-created dependency (the test
            // and real deployments create it immediately before the rule).
            // Cloudflare returns `MnmConfigMissing` (code 1004) until the new
            // config has propagated, so ride out that consistency window.
            Effect.retry({
                while: (e) => e._tag === "MnmConfigMissing",
                schedule: Schedule.max([
                    Schedule.exponential("500 millis"),
                    Schedule.recurs(8),
                ]),
            }), Effect.catchTag("DuplicateMnmRuleName", (error) => findByName(accountId, name).pipe(Effect.flatMap((existing) => existing ? Effect.succeed(existing) : Effect.fail(error)))));
            return toAttributes(observed, accountId);
        }
        // 3. Sync — diff observed cloud state against desired; the PATCH
        //    takes a full body, so send everything but skip the call
        //    entirely on a no-op.
        const dirty = observed.name !== name ||
            !samePrefixes(observed.prefixes, news.prefixes) ||
            (observed.automaticAdvertisement ?? false) !==
                (news.automaticAdvertisement ?? false) ||
            (news.bandwidthThreshold !== undefined &&
                observed.bandwidthThreshold !== news.bandwidthThreshold) ||
            (news.packetThreshold !== undefined &&
                observed.packetThreshold !== news.packetThreshold) ||
            (news.duration !== undefined &&
                normalizeDuration(observed.duration) !== news.duration) ||
            (news.zscoreSensitivity !== undefined &&
                observed.zscoreSensitivity !== news.zscoreSensitivity) ||
            (news.zscoreTarget !== undefined &&
                observed.zscoreTarget !== news.zscoreTarget) ||
            (news.prefixMatch !== undefined &&
                observed.prefixMatch !== news.prefixMatch);
        if (!dirty)
            return toAttributes(observed, accountId);
        const ruleId = observed.id;
        const patched = yield* mnm.patchRule({
            accountId,
            ruleId,
            name,
            type: news.type,
            prefixes: news.prefixes,
            automaticAdvertisement: news.automaticAdvertisement ?? false,
            bandwidthThreshold: news.bandwidthThreshold,
            packetThreshold: news.packetThreshold,
            duration: news.duration,
            zscoreSensitivity: news.zscoreSensitivity,
            zscoreTarget: news.zscoreTarget,
            prefixMatch: news.prefixMatch,
        });
        // Cloudflare omits `id` from the PATCH response body — carry the
        // observed id through.
        return toAttributes({ ...patched, id: patched.id ?? ruleId }, accountId);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* mnm
            .deleteRule({ accountId: output.accountId, ruleId: output.ruleId })
            .pipe(
        // Already gone (`MnmRuleNotFound`, Cloudflare code 1009) — also
        // covers Cloudflare cascading rule deletion when the account's
        // MNM config is deleted first.
        Effect.catchTag("MnmRuleNotFound", () => Effect.void));
    }),
    // MNM rules are account-scoped: enumerate every rule in the ambient
    // account. `listRules` paginates in "single" mode, so collect every
    // page and flatten its `result` array, hydrating each item into the
    // exact `read` Attributes shape. Accounts not onboarded to Magic
    // Network Monitoring reject the route with `Forbidden` (HTTP 403) —
    // treat that as "nothing to list" rather than an error.
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* mnm.listRules.pages({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? [])
            .filter((rule) => rule != null)
            .map((rule) => toAttributes(rule, accountId)))), Effect.catchTag("Forbidden", () => Effect.succeed([])));
    }),
});
/**
 * Read a rule by id, mapping "gone" (`MnmRuleNotFound`, Cloudflare error
 * code 1009) to `undefined`.
 */
const getRule = (accountId, ruleId) => mnm.getRule({ accountId, ruleId }).pipe(Effect.map((rule) => rule), Effect.catchTag("MnmRuleNotFound", () => Effect.succeed(undefined)));
/**
 * Find a rule by exact name. Names are unique per account, so at most one
 * rule can match. An account with no rules answers `result: null`.
 */
const findByName = (accountId, name) => mnm
    .listRules({ accountId })
    .pipe(Effect.map((response) => (response.result ?? []).find((rule) => rule?.name === name)));
const createRuleName = (id, name) => Effect.gen(function* () {
    return name ?? (yield* createPhysicalName({ id, lowercase: true }));
});
const samePrefixes = (observed, desired) => observed.length === desired.length &&
    [...observed].sort().join(",") === [...desired].sort().join(",");
/**
 * Cloudflare normalizes durations to Go notation on read (`1m` → `1m0s`,
 * `60m` → `1h0m0s`) — map the observed value back to the prop vocabulary
 * for diffing.
 */
const normalizeDuration = (duration) => {
    switch (duration) {
        case "1m0s":
        case "1m":
            return "1m";
        case "5m0s":
        case "5m":
            return "5m";
        case "10m0s":
        case "10m":
            return "10m";
        case "15m0s":
        case "15m":
            return "15m";
        case "20m0s":
        case "20m":
            return "20m";
        case "30m0s":
        case "30m":
            return "30m";
        case "45m0s":
        case "45m":
            return "45m";
        case "1h0m0s":
        case "60m":
            return "60m";
        default:
            return undefined;
    }
};
const toAttributes = (rule, accountId) => ({
    ruleId: rule.id,
    accountId,
    name: rule.name,
    // Distilled widens generated string enums to open unions (`string & {}`).
    type: rule.type,
    prefixes: [...rule.prefixes],
    automaticAdvertisement: rule.automaticAdvertisement ?? false,
    bandwidthThreshold: rule.bandwidthThreshold ?? undefined,
    packetThreshold: rule.packetThreshold ?? undefined,
    duration: rule.duration ?? undefined,
    zscoreSensitivity: rule.zscoreSensitivity ?? undefined,
    zscoreTarget: rule.zscoreTarget ?? undefined,
    prefixMatch: rule.prefixMatch ?? undefined,
});
//# sourceMappingURL=Rule.js.map