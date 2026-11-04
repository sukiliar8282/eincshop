import * as emailRouting from "@distilled.cloud/cloudflare/email-routing";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { resolveZoneId } from "../Zone/index.js";
import { listAllZones } from "../Zone/lookup.js";
import { retryWorkerScriptNotFound } from "./retry.js";
/**
 * A Cloudflare Email Routing rule.
 *
 * Rules forward inbound mail matching `matchers` to the listed actions
 * (forward to a verified destination, drop, or hand off to a Worker).
 * ### Forwarding Mail
 * **Example:** Forward `info@` to a verified destination
 * ```typescript
 * const rule = yield* Cloudflare.Email.Rule("InfoForward", {
 *   zone: "example.com",
 *   matchers: [{ type: "literal", field: "to", value: "info@example.com" }],
 *   actions: [{ type: "forward", value: ["ops@example.com"] }],
 * });
 * ```
 *
 * @resource
 * @product Email
 * @category Email
 */
export const Rule = Resource("Cloudflare.Email.Rule", {
    aliases: ["Cloudflare.EmailRule"],
});
export const RuleProvider = () => Provider.succeed(Rule, {
    stables: ["ruleId", "zoneId"],
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Email routing rules are zone-scoped (`/zones/{id}/email/routing/rules`)
        // with no account-wide enumeration API — fan out over every zone and
        // exhaustively paginate each zone's rules.
        const zones = yield* listAllZones(accountId);
        const rows = yield* Effect.forEach(zones, (zone) => emailRouting.listRules.pages({ zoneId: zone.id }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? [])
            // Cloudflare returns the zone's catch-all rule in this list,
            // but it's a managed singleton (owned by `CatchAll`, via
            // `/rules/catch_all`) and rejects deletion through the regular
            // rule endpoint ("Invalid rule operation"). Identify it by its
            // sole `{ type: "all" }` matcher and exclude it.
            .filter((rule) => !isCatchAllRule(rule))
            .map((rule) => normalize(rule, zone.id)))), 
        // Zones without email routing (or otherwise non-routable) reject
        // the route; skip them rather than failing the whole listing.
        Effect.catchTag("InvalidRoute", () => Effect.succeed([]))), { concurrency: 10 });
        return rows.flat();
    }),
    diff: Effect.fn(function* ({ news, output }) {
        if (!output)
            return undefined;
        if (!isResolved(news))
            return undefined;
        const zoneId = yield* resolve(news.zone);
        if (zoneId !== output.zoneId) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ output }) {
        if (!output?.ruleId || !output?.zoneId)
            return undefined;
        return yield* emailRouting
            .getRule({
            zoneId: output.zoneId,
            ruleIdentifier: output.ruleId,
        })
            .pipe(Effect.map((r) => normalize(r, output.zoneId)), Effect.catch(() => Effect.succeed(undefined)));
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        const zoneId = output?.zoneId ?? (yield* resolve(news.zone));
        const body = {
            actions: news.actions.map((a) => a.type === "drop"
                ? { type: a.type }
                : { type: a.type, value: a.value }),
            matchers: news.matchers.map((m) => m.type === "all"
                ? { type: "all" }
                : {
                    type: "literal",
                    field: "to",
                    value: m.value,
                }),
            enabled: news.enabled ?? true,
            name: news.name ?? "",
            priority: news.priority ?? 0,
        };
        if (output?.ruleId) {
            const result = yield* emailRouting
                .updateRule({
                zoneId,
                ruleIdentifier: output.ruleId,
                ...body,
            })
                .pipe(retryWorkerScriptNotFound, Effect.catch(() => emailRouting
                .createRule({ zoneId, ...body })
                .pipe(retryWorkerScriptNotFound)));
            return normalize(result, zoneId);
        }
        const result = yield* emailRouting
            .createRule({ zoneId, ...body })
            .pipe(retryWorkerScriptNotFound);
        return normalize(result, zoneId);
    }),
    delete: Effect.fn(function* ({ output }) {
        if (!output?.ruleId)
            return;
        // Idempotent: a rule that's already gone is success. Any other error
        // (e.g. a 409 because email routing is disabled) must surface so the
        // engine reports the failure instead of falsely claiming deletion.
        yield* emailRouting
            .deleteRule({
            zoneId: output.zoneId,
            ruleIdentifier: output.ruleId,
        })
            .pipe(Effect.catchTag("EmailRoutingRuleNotFound", () => Effect.void));
    }),
});
/**
 * The zone catch-all rule is surfaced by `listRules` but is a managed
 * singleton — its sole matcher is `{ type: "all" }`. It can only be mutated
 * via `/rules/catch_all` (the `CatchAll` resource), so it must be
 * excluded from the deletable `Rule` enumeration.
 */
const isCatchAllRule = (rule) => (rule.matchers ?? []).length === 1 && rule.matchers?.[0]?.type === "all";
const normalize = (rule, zoneId) => ({
    ruleId: rule.id ?? "",
    zoneId,
    name: rule.name ?? "",
    enabled: rule.enabled ?? true,
    priority: rule.priority ?? 0,
    matchers: (rule.matchers ?? []).map((m) => m.type === "all"
        ? { type: "all" }
        : { type: "literal", field: "to", value: m.value ?? "" }),
    actions: (rule.actions ?? []).map((a) => a.type === "drop"
        ? { type: "drop" }
        : a.type === "forward"
            ? { type: "forward", value: a.value ?? [] }
            : { type: "worker", value: a.value ?? [] }),
});
const resolve = Effect.fn(function* (zone) {
    const { accountId } = yield* yield* CloudflareEnvironment;
    return yield* resolveZoneId({
        accountId,
        zone,
        hostname: typeof zone === "string" ? zone : (zone.name ?? ""),
    });
});
//# sourceMappingURL=Rule.js.map