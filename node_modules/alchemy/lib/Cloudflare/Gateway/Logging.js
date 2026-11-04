import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.Gateway.Logging";
/**
 * Manages the **singleton** Cloudflare Zero Trust **Gateway logging
 * settings** for an account (`/accounts/{accountId}/gateway/logging`) —
 * PII redaction and per-rule-type (DNS / HTTP / L4) activity-log toggles.
 *
 * The singleton always exists, so reconcile converges only the fields you
 * declare (merging them over the observed state before the PUT, since the
 * API is PUT-only). The pre-management snapshot is captured on first touch
 * and restored on destroy (capture-and-restore).
 * ### Managing logging settings
 * **Example:** Log everything, keep PII
 * ```typescript
 * yield* Cloudflare.Gateway.Logging("Logging", {
 *   redactPii: false,
 *   settingsByRuleType: {
 *     dns: { logAll: true, logBlocks: true },
 *     http: { logAll: true, logBlocks: true },
 *     l4: { logAll: true, logBlocks: true },
 *   },
 * });
 * ```
 *
 * **Example:** Only log blocked DNS queries, redacting PII
 * ```typescript
 * yield* Cloudflare.Gateway.Logging("Logging", {
 *   redactPii: true,
 *   settingsByRuleType: {
 *     dns: { logAll: false, logBlocks: true },
 *   },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/insights/logs/gateway-logs/
 *
 * @resource
 * @product Gateway
 * @category Cloudflare One (Zero Trust)
 */
export const Logging = Resource(TypeId);
/**
 * Returns true if the given value is a Logging resource.
 */
export const isLogging = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const LoggingProvider = () => Provider.succeed(Logging, {
    nuke: { singleton: true },
    stables: ["accountId", "initialSettings"],
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Account singleton — there is no enumeration API; the Gateway
        // logging settings object always exists for the account. Mirror
        // `read`: observe the single instance and return it as a
        // one-element array (its observed snapshot is its own
        // `initialSettings`, since nothing is being managed).
        const observed = yield* observeLogging(accountId);
        return [toAttributes(accountId, observed, observed)];
    }),
    read: Effect.fn(function* ({ output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        const observed = yield* observeLogging(acct);
        // The singleton always exists with account defaults — there is
        // nothing to "own", so a cold read adopts freely. The observed
        // snapshot at adoption time becomes the restore target.
        const initialSettings = output?.initialSettings ?? observed;
        return toAttributes(acct, observed, initialSettings);
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // 1. Observe — the singleton always exists; read its live state.
        const observed = yield* observeLogging(accountId);
        // 2. Capture — the pre-management snapshot, restored on destroy.
        const initialSettings = output?.initialSettings ?? observed;
        // 3. Sync — merge the declared fields over the observed state and
        //    PUT only when something actually changes (the API has no
        //    PATCH, so the merge keeps undeclared fields at their current
        //    values).
        const desired = mergeSnapshot(observed, {
            redactPii: news.redactPii,
            dns: news.settingsByRuleType?.dns,
            http: news.settingsByRuleType?.http,
            l4: news.settingsByRuleType?.l4,
        });
        if (sameSnapshot(observed, desired)) {
            return toAttributes(accountId, observed, initialSettings);
        }
        yield* putLogging(accountId, desired);
        // 4. Return — re-read so attrs reflect post-sync truth.
        const final = yield* observeLogging(accountId);
        return toAttributes(accountId, final, initialSettings);
    }),
    delete: Effect.fn(function* ({ output }) {
        const { accountId, initialSettings } = output;
        // Observe — skip the restore when the account already matches the
        // captured snapshot (idempotent re-delete after a crashed run).
        const observed = yield* observeLogging(accountId);
        if (sameSnapshot(observed, initialSettings))
            return;
        yield* putLogging(accountId, initialSettings);
    }),
});
/**
 * Read the live logging settings, normalized to a `null`-free snapshot.
 */
const observeLogging = (accountId) => zeroTrust.getGatewayLogging({ accountId }).pipe(Effect.map((s) => {
    const snapshot = {};
    if (s.redactPii != null)
        snapshot.redactPii = s.redactPii;
    const byType = s.settingsByRuleType ?? undefined;
    for (const key of RULE_TYPES) {
        const block = byType?.[key];
        if (block == null)
            continue;
        const rule = {};
        if (block.logAll != null)
            rule.logAll = block.logAll;
        if (block.logBlocks != null)
            rule.logBlocks = block.logBlocks;
        snapshot[key] = rule;
    }
    return snapshot;
}));
const putLogging = (accountId, snapshot) => zeroTrust.putGatewayLogging({
    accountId,
    ...(snapshot.redactPii !== undefined
        ? { redactPii: snapshot.redactPii }
        : {}),
    settingsByRuleType: {
        ...(snapshot.dns !== undefined ? { dns: snapshot.dns } : {}),
        ...(snapshot.http !== undefined ? { http: snapshot.http } : {}),
        ...(snapshot.l4 !== undefined ? { l4: snapshot.l4 } : {}),
    },
});
const RULE_TYPES = ["dns", "http", "l4"];
/**
 * Overlay the declared (non-undefined) fields onto the observed snapshot,
 * merging per-rule-type blocks field-by-field.
 */
const mergeSnapshot = (observed, declared) => {
    const merged = observed.redactPii !== undefined ? { redactPii: observed.redactPii } : {};
    if (declared.redactPii !== undefined)
        merged.redactPii = declared.redactPii;
    for (const key of RULE_TYPES) {
        const base = observed[key];
        const over = declared[key];
        if (base === undefined && over === undefined)
            continue;
        const rule = { ...base };
        if (over?.logAll !== undefined)
            rule.logAll = over.logAll;
        if (over?.logBlocks !== undefined)
            rule.logBlocks = over.logBlocks;
        merged[key] = rule;
    }
    return merged;
};
const sameSnapshot = (a, b) => a.redactPii === b.redactPii &&
    RULE_TYPES.every((key) => (a[key]?.logAll ?? undefined) === (b[key]?.logAll ?? undefined) &&
        (a[key]?.logBlocks ?? undefined) === (b[key]?.logBlocks ?? undefined));
const toAttributes = (accountId, observed, initialSettings) => ({
    ...observed,
    accountId,
    initialSettings,
});
//# sourceMappingURL=Logging.js.map