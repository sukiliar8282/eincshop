import * as tokenValidation from "@distilled.cloud/cloudflare/token-validation";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { listAllZones } from "../Zone/lookup.js";
const TypeId = "Cloudflare.TokenValidation.Rule";
/**
 * An API Shield JWT validation rule — selects operations/hosts on a zone
 * and enforces a token validation expression with a `log` or `block`
 * action.
 *
 * A rule references a {@link TokenConfiguration} by UUID inside its
 * `expression` (e.g. `is_jwt_valid("<configId>")`). Keep the rule
 * depending on the configuration through its output so destroy order is
 * rule first, configuration second.
 *
 * JWT validation is an API Shield feature (Enterprise add-on) — accounts
 * without the entitlement receive the typed `TokenValidationNotEntitled`
 * error (Cloudflare code 10403) on every call.
 *
 * All fields are patched in place; only `zoneId` forces a replacement.
 * ### Creating a Rule
 * **Example:** Log requests with invalid JWTs
 * ```typescript
 * const rule = yield* Cloudflare.TokenValidation.Rule("LogInvalidJwt", {
 *   zoneId: zone.zoneId,
 *   action: "log",
 *   expression: Output.interpolate`is_jwt_valid("${config.configId}")`,
 *   selector: { include: [{ host: ["api.example.com"] }] },
 * });
 * ```
 *
 * **Example:** Block invalid JWTs, excluding a public operation
 * ```typescript
 * yield* Cloudflare.TokenValidation.Rule("BlockInvalidJwt", {
 *   zoneId: zone.zoneId,
 *   action: "block",
 *   expression: Output.interpolate`is_jwt_valid("${config.configId}")`,
 *   selector: {
 *     include: [{ host: ["api.example.com"] }],
 *     exclude: [{ operationIds: [healthCheck.operationId] }],
 *   },
 * });
 * ```
 *
 * ### Updating a Rule
 * **Example:** Disable a rule in place
 * ```typescript
 * yield* Cloudflare.TokenValidation.Rule("BlockInvalidJwt", {
 *   zoneId: zone.zoneId,
 *   enabled: false,
 *   action: "block",
 *   expression: Output.interpolate`is_jwt_valid("${config.configId}")`,
 *   selector: { include: [{ host: ["api.example.com"] }] },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/api-shield/security/jwt-validation/
 *
 * @resource
 * @product Token Validation
 * @category Application Security
 */
export const Rule = Resource(TypeId);
/**
 * Returns true if the given value is a Rule resource.
 */
export const isRule = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const RuleProvider = () => Provider.succeed(Rule, {
    stables: ["ruleId", "zoneId", "createdAt"],
    diff: Effect.fn(function* ({ olds, news, output }) {
        if (!isResolved(news))
            return undefined;
        // Moving between zones replaces the rule.
        const oldZoneId = output?.zoneId ?? olds?.zoneId;
        if (typeof oldZoneId === "string" && oldZoneId !== news.zoneId) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const zoneId = output?.zoneId ?? olds?.zoneId;
        if (zoneId === undefined)
            return undefined;
        // Owned path: refresh by our persisted UUID.
        if (output?.ruleId) {
            const observed = yield* getRule(zoneId, output.ruleId);
            if (observed)
                return toAttributes(observed, zoneId);
        }
        // Cold read — recover from lost state by matching the deterministic
        // physical title (client-side; the list API cannot filter by title).
        // Rules carry no ownership markers, so an existing match is reported
        // as `Unowned` and the engine gates takeover behind the adopt policy.
        const title = yield* createRuleTitle(id, olds?.title);
        const match = yield* findByTitle(zoneId, title);
        if (match?.id) {
            const observed = yield* getRule(zoneId, match.id);
            if (observed)
                return Unowned(toAttributes(observed, zoneId));
        }
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        // Inputs have been resolved to concrete values by Plan.
        const zoneId = news.zoneId;
        const expression = news.expression;
        const title = yield* createRuleTitle(id, news.title);
        const desired = {
            title,
            description: news.description ?? "",
            enabled: news.enabled ?? true,
            action: news.action,
            expression,
            selector: toApiSelector(news.selector),
        };
        // 1. Observe — the UUID cached on `output` is a hint, not a
        //    guarantee: a 404 falls through to "missing" and we recreate.
        const observed = output?.ruleId
            ? yield* getRule(zoneId, output.ruleId)
            : undefined;
        // 2. Ensure — greenfield (or out-of-band delete): create with the
        //    full desired body. Titles are not unique on Cloudflare's side,
        //    so there is no AlreadyExists race to tolerate.
        if (!observed) {
            const created = yield* tokenValidation.createRule({
                zoneId,
                ...desired,
            });
            // Ordering is only expressible via PATCH; apply it when requested.
            if (news.position !== undefined && created.id) {
                const positioned = yield* tokenValidation.patchRule({
                    zoneId,
                    ruleId: created.id,
                    position: news.position,
                });
                return toAttributes(positioned, zoneId);
            }
            return toAttributes(created, zoneId);
        }
        // 3. Sync — diff observed cloud state against desired field by
        //    field; PATCH only when something differs (or an explicit
        //    `position` must be enforced — ordering cannot be observed
        //    cheaply, so a set position is re-asserted on every deploy).
        const dirty = observed.title !== desired.title ||
            observed.description !== desired.description ||
            observed.enabled !== desired.enabled ||
            observed.action !== desired.action ||
            observed.expression !== desired.expression ||
            !sameSelector(observed.selector, desired.selector);
        if (!dirty && news.position === undefined) {
            return toAttributes(observed, zoneId);
        }
        const patched = yield* tokenValidation.patchRule({
            zoneId,
            ruleId: observed.id ?? output.ruleId,
            ...desired,
            ...(news.position !== undefined ? { position: news.position } : {}),
        });
        return toAttributes(patched, zoneId);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* tokenValidation
            .deleteRule({ zoneId: output.zoneId, ruleId: output.ruleId })
            .pipe(Effect.catchTag("TokenValidationRuleNotFound", () => Effect.void));
    }),
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Token validation rules live inside a zone with no account-wide
        // enumeration API — fan out across every zone and list rules per
        // zone, paginating each zone exhaustively.
        const zones = yield* listAllZones(accountId);
        const rows = yield* Effect.forEach(zones, (zone) => tokenValidation.listRules.pages({ zoneId: zone.id }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((rule) => toAttributes(rule, zone.id)))), 
        // JWT validation is an API Shield (Enterprise) feature; zones
        // without the entitlement, or with partial permissions, reject
        // the route — skip them rather than failing the whole listing.
        Effect.catchTag(["TokenValidationNotEntitled", "Forbidden"], () => Effect.succeed([]))), { concurrency: 10 });
        return rows.flat();
    }),
});
/**
 * Read a rule by UUID, mapping "gone" (`TokenValidationRuleNotFound`,
 * HTTP 404) to `undefined`.
 */
const getRule = (zoneId, ruleId) => tokenValidation.getRule({ zoneId, ruleId }).pipe(Effect.map((r) => r), Effect.catchTag("TokenValidationRuleNotFound", () => Effect.succeed(undefined)));
/**
 * Find a rule by exact title. The list API cannot filter by title, so
 * match client-side; if several rules share the title, pick the oldest
 * for determinism.
 */
const findByTitle = (zoneId, title) => tokenValidation.listRules.items({ zoneId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
    .filter((r) => r.title === title)
    .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""))
    .at(0)));
const createRuleTitle = (id, title) => Effect.gen(function* () {
    return title ?? (yield* createPhysicalName({ id, lowercase: true }));
});
/**
 * Convert resolved props' selector to the API request shape (the
 * `Input<string>` operation IDs have been resolved by Plan).
 */
const toApiSelector = (selector) => ({
    ...(selector.include !== undefined
        ? { include: selector.include.map((entry) => ({ host: entry.host })) }
        : {}),
    ...(selector.exclude !== undefined
        ? {
            exclude: selector.exclude.map((entry) => ({
                operationIds: entry.operationIds,
            })),
        }
        : {}),
});
/** Canonical, order-insensitive form of a selector for diffing. */
const canonicalSelector = (selector) => JSON.stringify({
    include: (selector.include ?? [])
        .map((entry) => [...(entry.host ?? [])].sort())
        .sort(),
    exclude: (selector.exclude ?? [])
        .map((entry) => [...(entry.operationIds ?? [])].sort())
        .sort(),
});
const sameSelector = (observed, desired) => canonicalSelector(observed) === canonicalSelector(desired);
const toAttributes = (rule, zoneId) => ({
    ruleId: rule.id ?? "",
    zoneId,
    title: rule.title,
    description: rule.description,
    enabled: rule.enabled,
    // Distilled widens the action enum to an open union (`string & {}`).
    action: rule.action,
    expression: rule.expression,
    selector: {
        ...(rule.selector.include != null
            ? {
                include: rule.selector.include.map((entry) => entry.host != null ? { host: [...entry.host] } : {}),
            }
            : {}),
        ...(rule.selector.exclude != null
            ? {
                exclude: rule.selector.exclude.map((entry) => entry.operationIds != null
                    ? { operationIds: [...entry.operationIds] }
                    : {}),
            }
            : {}),
    },
    createdAt: rule.createdAt ?? undefined,
    lastUpdated: rule.lastUpdated ?? undefined,
});
//# sourceMappingURL=Rule.js.map