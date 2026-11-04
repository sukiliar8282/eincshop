import * as flagship from "@distilled.cloud/cloudflare/flagship";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { deepEqual, isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.Flagship.Flag";
/**
 * A feature flag in a Cloudflare Flagship app.
 *
 * A flag maps a key to a set of variations plus targeting rules. Workers
 * evaluate flags through the `Flagship` binding (or the REST evaluate
 * endpoint); changing variations, rules, enablement, or the default
 * variation takes effect without redeploying code. Everything except the
 * flag key and the parent app is mutable in place.
 * ### Creating a Flag
 * **Example:** Boolean flag
 * ```typescript
 * const app = yield* Cloudflare.Flagship.App("Flags", {});
 *
 * const flag = yield* Cloudflare.Flagship.Flag("NewCheckout", {
 *   appId: app.appId,
 *   key: "new-checkout",
 *   defaultVariation: "off",
 *   variations: { off: false, on: true },
 * });
 * ```
 *
 * **Example:** String flag with multiple variations
 * ```typescript
 * const flag = yield* Cloudflare.Flagship.Flag("CheckoutFlow", {
 *   appId: app.appId,
 *   key: "checkout-flow",
 *   defaultVariation: "v1",
 *   variations: { v1: "classic", v2: "express", v3: "one-click" },
 * });
 * ```
 *
 * ### Targeting Rules
 * **Example:** Serve a variation to a specific country
 * ```typescript
 * const flag = yield* Cloudflare.Flagship.Flag("DarkMode", {
 *   appId: app.appId,
 *   key: "dark-mode",
 *   defaultVariation: "off",
 *   variations: { off: false, on: true },
 *   rules: [
 *     {
 *       priority: 1,
 *       conditions: [
 *         { attribute: "country", operator: "equals", value: "US" },
 *       ],
 *       serveVariation: "on",
 *     },
 *   ],
 * });
 * ```
 *
 * **Example:** Percentage rollout
 * ```typescript
 * const flag = yield* Cloudflare.Flagship.Flag("NewSearch", {
 *   appId: app.appId,
 *   key: "new-search",
 *   defaultVariation: "off",
 *   variations: { off: false, on: true },
 *   rules: [
 *     {
 *       priority: 1,
 *       conditions: [],
 *       serveVariation: "on",
 *       rollout: { percentage: 25 },
 *     },
 *   ],
 * });
 * ```
 *
 * ### Toggling a Flag
 * **Example:** Disable a flag without removing its rules
 * ```typescript
 * const flag = yield* Cloudflare.Flagship.Flag("NewCheckout", {
 *   appId: app.appId,
 *   key: "new-checkout",
 *   enabled: false,
 *   defaultVariation: "off",
 *   variations: { off: false, on: true },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/flagship/
 * @see https://developers.cloudflare.com/api/resources/flagship/
 *
 * @resource
 * @product Flagship
 * @category Developer Platform
 */
export const Flag = Resource(TypeId);
/**
 * Returns true if the given value is a Flagship Flag resource.
 */
export const isFlag = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const FlagProvider = () => Provider.succeed(Flag, {
    stables: ["appId", "accountId", "key"],
    diff: Effect.fn(function* ({ olds, news, output }) {
        if (!isResolved(news))
            return undefined;
        const { accountId } = yield* yield* CloudflareEnvironment;
        if ((output?.accountId ?? accountId) !== accountId) {
            return { action: "replace" };
        }
        // The app is a path parameter — a flag cannot move between apps in
        // place. By diff time both sides are resolved strings.
        const oldAppId = output?.appId ?? olds?.appId;
        if (typeof oldAppId === "string" &&
            typeof news.appId === "string" &&
            oldAppId !== news.appId) {
            return { action: "replace" };
        }
        // The key is the flag's identity within the app.
        const oldKey = output?.key ?? olds?.key;
        if (typeof oldKey === "string" &&
            typeof news.key === "string" &&
            oldKey !== news.key) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, olds, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        const appId = output?.appId ?? olds?.appId;
        if (appId === undefined)
            return undefined;
        // The key is deterministic (explicit or generated from the logical
        // ID), so a cold read and a warm read are the same lookup.
        const key = output?.key ?? (yield* createFlagKey(id, olds?.key));
        const observed = yield* getFlag(acct, appId, key);
        return observed ? toAttributes(observed, acct, appId) : undefined;
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const appId = news.appId;
        const key = yield* createFlagKey(id, news.key);
        const desired = {
            enabled: news.enabled ?? true,
            defaultVariation: news.defaultVariation,
            variations: news.variations,
            rules: news.rules ?? [],
            description: news.description,
        };
        // Observe — flag identity is (appId, key); a missing flag falls
        // through and we recreate.
        const observed = yield* getFlag(output?.accountId ?? accountId, appId, key);
        if (!observed) {
            // Ensure — greenfield (or out-of-band delete). A concurrent create
            // of the same key surfaces as FlagshipFlagAlreadyExists; treat it
            // as a race and converge via the update path below.
            const created = yield* flagship
                .createAppFlag({
                accountId,
                appId,
                key,
                ...desired,
                type: news.type,
            })
                .pipe(Effect.catchTag("FlagshipFlagAlreadyExists", () => Effect.succeed(undefined)));
            if (created) {
                return toAttributes(created, accountId, appId);
            }
        }
        // Sync — diff observed cloud state against desired; the update API is
        // a PUT that takes the full body, so send everything, but skip the
        // call entirely on a no-op.
        const live = observed ?? (yield* getFlag(accountId, appId, key));
        if (live) {
            const observedShape = {
                enabled: live.enabled,
                defaultVariation: live.defaultVariation,
                variations: live.variations,
                rules: normalizeRules(live.rules),
                description: live.description ?? undefined,
            };
            const desiredShape = {
                ...desired,
                rules: normalizeRules(desired.rules),
            };
            if (deepEqual(observedShape, desiredShape)) {
                return toAttributes(live, accountId, appId);
            }
        }
        const updated = yield* flagship.updateAppFlag({
            accountId,
            appId,
            flagKey: key,
            key,
            ...desired,
            type: news.type,
        });
        return toAttributes(updated, accountId, appId);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* flagship
            .deleteAppFlag({
            accountId: output.accountId,
            appId: output.appId,
            flagKey: output.key,
        })
            // A missing flag or a missing parent app both mean it's already
            // gone.
            .pipe(Effect.catchTag(["FlagshipFlagNotFound", "FlagshipAppNotFound"], () => Effect.void));
    }),
    // Flags are sub-resources keyed by (accountId, appId, key). There is no
    // account-wide flag enumeration, so enumerate every Flagship app first,
    // then fan out the per-app flag list and flatten.
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const apps = yield* flagship.listApps.pages({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.result ?? [])));
        const rows = yield* Effect.forEach(apps, (app) => flagship.listAppFlags.pages({ accountId, appId: app.id }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((flag) => toAttributes(flag, accountId, app.id)))), 
        // The parent app can be deleted between enumeration and the
        // per-app flag list; treat a gone app as having no flags.
        Effect.catchTag("FlagshipAppNotFound", () => Effect.succeed([]))), { concurrency: 10 });
        return rows.flat();
    }),
});
/**
 * Read a flag by key, mapping "gone" (`FlagshipFlagNotFound`, or a deleted
 * parent app surfacing as `FlagshipAppNotFound`) to `undefined`.
 */
const getFlag = (accountId, appId, flagKey) => flagship
    .getAppFlag({ accountId, appId, flagKey })
    .pipe(Effect.catchTag(["FlagshipFlagNotFound", "FlagshipAppNotFound"], () => Effect.succeed(undefined)));
const createFlagKey = (id, key) => Effect.gen(function* () {
    return key ?? (yield* createPhysicalName({ id, lowercase: true }));
});
/**
 * Wire rules carry readonly markers, open-union widening, and explicit
 * nulls; strip them so rules diff structurally against the user's props.
 */
const normalizeRules = (rules) => rules.map((rule) => ({
    conditions: normalizeConditions(rule.conditions),
    priority: rule.priority,
    serveVariation: rule.serveVariation,
    ...(rule.rollout
        ? {
            rollout: {
                percentage: rule.rollout.percentage,
                ...(rule.rollout.attribute != null
                    ? { attribute: rule.rollout.attribute }
                    : {}),
            },
        }
        : {}),
}));
const normalizeConditions = (conditions) => conditions.flatMap((condition) => {
    if (Predicate.hasProperty(condition, "clauses")) {
        const group = condition;
        return [
            {
                clauses: normalizeConditions(group.clauses),
                logicalOperator: group.logicalOperator,
            },
        ];
    }
    if (Predicate.hasProperty(condition, "attribute")) {
        const flat = condition;
        return [
            {
                attribute: flat.attribute,
                operator: flat.operator,
                value: flat.value,
            },
        ];
    }
    return [];
});
const toAttributes = (flag, accountId, appId) => ({
    appId,
    accountId,
    key: flag.key,
    enabled: flag.enabled,
    defaultVariation: flag.defaultVariation,
    variations: flag.variations,
    rules: normalizeRules(flag.rules),
    description: flag.description ?? undefined,
    type: flag.type ?? undefined,
    updatedAt: flag.updatedAt ?? undefined,
    updatedBy: flag.updatedBy ?? undefined,
});
//# sourceMappingURL=Flag.js.map