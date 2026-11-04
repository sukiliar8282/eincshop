import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { arrayEquals } from "../../Util/equal.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
/**
 * A Cloudflare Zero Trust Gateway rule.
 *
 * Gateway rules sit on the WARP/Gateway data plane and run *before* Access:
 * they decide whether to allow, block, override, isolate, or redirect a
 * request based on wirefilter expressions over the request traffic,
 * the authenticated identity, and the device posture. The most common
 * companion to {@link Application} with a `private` destination is a
 * `dns` rule with `action: "override"` that points an internal hostname at
 * a Cloudflare Tunnel — without it, WARP intercepts the lookup but has
 * nowhere to send the answer.
 * ### DNS override for a private app
 * **Example:** Resolve an internal hostname through a Cloudflare Tunnel
 * ```typescript
 * const adminDns = yield* Cloudflare.Gateway.Rule("AdminMicroagiDns", {
 *   name: "research-admin-microagi-dns-override",
 *   action: "override",
 *   filters: ["dns"],
 *   traffic: 'any(dns.domains[*] == "cluster-admin.microagi")',
 *   ruleSettings: {
 *     overrideHost: `${tunnel.tunnelId}.cfargotunnel.com`,
 *   },
 *   enabled: true,
 * });
 * ```
 *
 * ### Block a category
 * **Example:** Block known phishing on HTTP
 * ```typescript
 * yield* Cloudflare.Gateway.Rule("BlockPhishing", {
 *   name: "block-phishing",
 *   action: "block",
 *   filters: ["http"],
 *   traffic: "any(http.request.uri.content_category[*] in {178})",
 * });
 * ```
 *
 * @resource
 * @product Gateway
 * @category Cloudflare One (Zero Trust)
 */
export const Rule = Resource("Cloudflare.Gateway.Rule");
// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export const RuleProvider = () => Provider.effect(Rule, Effect.gen(function* () {
    const env = yield* CloudflareEnvironment;
    const createRule = yield* zeroTrust.createGatewayRule;
    const getRule = yield* zeroTrust.getGatewayRule;
    const updateRule = yield* zeroTrust.updateGatewayRule;
    const deleteRule = yield* zeroTrust.deleteGatewayRule;
    const listRules = zeroTrust.listGatewayRules;
    const resolveName = (id, name) => Effect.gen(function* () {
        if (name)
            return name;
        return yield* createPhysicalName({ id });
    });
    // Locate an existing rule by name when no ruleId is cached — used for
    // adoption and as a recovery path after a create returns a conflict.
    const findRuleByName = (accountId, name) => listRules.items({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).find((r) => r.name === name)), Effect.map((found) => found === undefined
        ? undefined
        : narrowRule(found)));
    const observeById = (accountId, ruleId) => Effect.gen(function* () {
        const r = yield* getRule({ accountId, ruleId }).pipe(
        // Distilled tags transport errors but not the live Cloudflare 404
        // for a missing rule. Swallow generically so the reconcile flow
        // falls through to recreate.
        Effect.catch(() => Effect.succeed(undefined)));
        if (r === undefined)
            return undefined;
        return narrowRule(r);
    });
    return {
        stables: ["ruleId", "action", "accountId"],
        // Account collection (pattern b): Gateway rules are account-scoped
        // (`/accounts/{id}/gateway/rules`). Exhaustively page the list op,
        // narrow each rule, and hydrate the exact `read` Attributes shape.
        // Rules missing a required field (id/action/filters/precedence) are
        // dropped rather than surfaced as partial rows.
        list: () => Effect.gen(function* () {
            const { accountId } = yield* env;
            return yield* listRules.pages({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).flatMap((raw) => {
                const r = narrowRule(raw);
                if (!r.id ||
                    !r.action ||
                    !r.filters ||
                    r.precedence === undefined) {
                    return [];
                }
                return [
                    {
                        ruleId: r.id,
                        name: r.name ?? r.id,
                        action: r.action,
                        filters: r.filters,
                        precedence: r.precedence,
                        accountId,
                        createdAt: r.createdAt,
                        updatedAt: r.updatedAt,
                    },
                ];
            }))));
        }),
        diff: Effect.fn(function* ({ olds = {}, news }) {
            if (olds.action !== undefined) {
                if (olds.action !== news.action) {
                    return { action: "replace" };
                }
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output }) {
            const { accountId } = yield* env;
            const resolvedName = yield* resolveName(id, news.name);
            const body = buildMutableBody(news, resolvedName);
            // 1. Observe
            let observed;
            if (output?.ruleId) {
                observed = yield* observeById(accountId, output.ruleId);
            }
            if (!observed) {
                // Adoption / recovery path — look up by name. Cheap relative to
                // the create call we'd otherwise blow up on a duplicate name.
                observed = yield* findRuleByName(accountId, resolvedName);
            }
            // 2. Ensure
            if (!observed) {
                const created = yield* createRule({
                    accountId,
                    name: resolvedName,
                    action: body.action,
                    filters: Array.from(body.filters),
                    traffic: body.traffic,
                    identity: body.identity,
                    devicePosture: body.devicePosture,
                    ruleSettings: body.ruleSettings,
                    precedence: body.precedence,
                    enabled: body.enabled,
                    description: body.description,
                }).pipe(
                // Distilled does not tag Conflict — fall back to a name lookup
                // before re-failing so a racing create still converges.
                Effect.catch((err) => Effect.gen(function* () {
                    const existing = yield* findRuleByName(accountId, resolvedName);
                    if (existing)
                        return existing;
                    return yield* Effect.fail(err);
                })));
                observed = narrowRule(created);
            }
            // 3. Sync
            if (!observed.id) {
                return yield* Effect.fail(new Error("Cloudflare did not return a rule id for Gateway rule"));
            }
            if (!bodyEqualsObserved(body, observed)) {
                const updated = yield* updateRule({
                    accountId,
                    ruleId: observed.id,
                    name: resolvedName,
                    action: body.action,
                    filters: Array.from(body.filters),
                    traffic: body.traffic,
                    identity: body.identity,
                    devicePosture: body.devicePosture,
                    ruleSettings: body.ruleSettings,
                    precedence: body.precedence,
                    enabled: body.enabled,
                    description: body.description,
                });
                observed = narrowRule(updated);
            }
            // 4. Return
            if (!observed.id ||
                !observed.action ||
                !observed.filters ||
                observed.precedence === undefined) {
                return yield* Effect.fail(new Error("Cloudflare returned a Gateway rule without id/action/filters/precedence"));
            }
            return {
                ruleId: observed.id,
                name: observed.name ?? resolvedName,
                action: observed.action,
                filters: observed.filters,
                precedence: observed.precedence,
                accountId,
                createdAt: observed.createdAt,
                updatedAt: observed.updatedAt,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* deleteRule({
                accountId: output.accountId,
                ruleId: output.ruleId,
            }).pipe(Effect.catch(() => Effect.void));
        }),
        read: Effect.fn(function* ({ output }) {
            if (!output?.ruleId)
                return undefined;
            const observed = yield* observeById(output.accountId, output.ruleId);
            if (!observed?.id ||
                !observed.action ||
                !observed.filters ||
                observed.precedence === undefined) {
                return undefined;
            }
            return {
                ruleId: observed.id,
                name: observed.name ?? output.name,
                action: observed.action,
                filters: observed.filters,
                precedence: observed.precedence,
                accountId: output.accountId,
                createdAt: observed.createdAt ?? output.createdAt,
                updatedAt: observed.updatedAt ?? output.updatedAt,
            };
        }),
    };
}));
const undef = (v) => v == null ? undefined : v;
const undefArr = (v) => v == null ? undefined : v.filter((x) => x != null);
const narrowRule = (raw) => ({
    id: undef(raw.id),
    name: undef(raw.name),
    action: raw.action == null ? undefined : raw.action,
    filters: undefArr(raw.filters ?? undefined),
    traffic: undef(raw.traffic),
    identity: undef(raw.identity),
    devicePosture: undef(raw.devicePosture),
    precedence: undef(raw.precedence),
    enabled: undef(raw.enabled),
    description: undef(raw.description),
    ruleSettings: undef(raw.ruleSettings),
    createdAt: undef(raw.createdAt),
    updatedAt: undef(raw.updatedAt),
});
const buildMutableBody = (news, resolvedName) => {
    const body = {
        name: resolvedName,
        action: news.action,
        filters: news.filters,
    };
    if (news.traffic !== undefined)
        body.traffic = news.traffic;
    if (news.identity !== undefined)
        body.identity = news.identity;
    if (news.devicePosture !== undefined)
        body.devicePosture = news.devicePosture;
    if (news.ruleSettings !== undefined)
        body.ruleSettings = news.ruleSettings;
    if (news.precedence !== undefined)
        body.precedence = news.precedence;
    if (news.enabled !== undefined)
        body.enabled = news.enabled;
    if (news.description !== undefined)
        body.description = news.description;
    return body;
};
// ---------------------------------------------------------------------------
// Drift detection
// ---------------------------------------------------------------------------
const bodyEqualsObserved = (desired, observed) => {
    if (desired.name !== observed.name)
        return false;
    if (desired.action !== observed.action)
        return false;
    if (!arrayEquals(desired.filters, observed.filters))
        return false;
    if (desired.traffic !== undefined && desired.traffic !== observed.traffic) {
        return false;
    }
    if (desired.identity !== undefined &&
        desired.identity !== observed.identity) {
        return false;
    }
    if (desired.devicePosture !== undefined &&
        desired.devicePosture !== observed.devicePosture) {
        return false;
    }
    if (desired.precedence !== undefined &&
        desired.precedence !== observed.precedence) {
        return false;
    }
    if (desired.enabled !== undefined && desired.enabled !== observed.enabled) {
        return false;
    }
    if (desired.description !== undefined &&
        desired.description !== observed.description) {
        return false;
    }
    // ruleSettings is a deeply-nested object whose server echo may include
    // extra `null` fields. Stringify-compare only when the caller set them.
    if (desired.ruleSettings !== undefined) {
        if (JSON.stringify(desired.ruleSettings) !==
            JSON.stringify(observed.ruleSettings ?? {})) {
            return false;
        }
    }
    return true;
};
//# sourceMappingURL=Rule.js.map