import * as turnstile from "@distilled.cloud/cloudflare/turnstile";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Redacted from "effect/Redacted";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.Turnstile.Widget";
/**
 * A Cloudflare Turnstile widget — Cloudflare's CAPTCHA alternative.
 *
 * A widget is identified by its auto-assigned `sitekey` (the public key you
 * embed in HTML) and produces a `secret` used server-side against the
 * `/turnstile/v0/siteverify` endpoint. Name, domains, mode, and clearance
 * settings are all mutable in place; only `region` forces a replacement.
 * ### Creating a Widget
 * **Example:** Managed widget
 * ```typescript
 * const widget = yield* Cloudflare.Turnstile.Widget("signup-form", {
 *   domains: ["example.com"],
 *   mode: "managed",
 * });
 * ```
 *
 * **Example:** Invisible widget with an explicit name
 * ```typescript
 * const widget = yield* Cloudflare.Turnstile.Widget("api-guard", {
 *   name: "api-guard",
 *   domains: ["example.com", "app.example.com"],
 *   mode: "invisible",
 * });
 * ```
 *
 * ### Using the keys
 * **Example:** Embedding the sitekey and verifying tokens
 * ```typescript
 * // The sitekey is public — render it in your HTML:
 * const sitekey = widget.sitekey;
 *
 * // The secret is redacted — pass it to your server-side verifier:
 * const secret = widget.secret; // Redacted<string>
 * ```
 *
 * @see https://developers.cloudflare.com/turnstile/
 *
 * @resource
 * @product Turnstile
 * @category Application Security
 */
export const Widget = Resource(TypeId);
/**
 * Returns true if the given value is a Widget resource.
 */
export const isWidget = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const WidgetProvider = () => Provider.succeed(Widget, {
    stables: ["sitekey", "accountId", "region", "createdOn"],
    diff: Effect.fn(function* ({ olds, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        if (!isResolved(news))
            return undefined;
        if ((output?.accountId ?? accountId) !== accountId) {
            return { action: "replace" };
        }
        // Region cannot be changed after creation.
        const oldRegion = output?.region ?? olds?.region ?? "world";
        if ((news.region ?? "world") !== oldRegion) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        if (output?.sitekey) {
            const observed = yield* getWidget(acct, output.sitekey);
            return observed ? toAttributes(observed, acct) : undefined;
        }
        // Cold read — recover from lost state by matching the deterministic
        // physical name. Names are not unique on Cloudflare's side; an exact
        // match on our generated/explicit name is the best identity we have.
        const name = yield* createWidgetName(id, olds?.name);
        const match = yield* findByName(acct, name);
        if (match) {
            const observed = yield* getWidget(acct, match.sitekey);
            return observed ? toAttributes(observed, acct) : undefined;
        }
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const name = yield* createWidgetName(id, news.name);
        // Observe — the sitekey cached on `output` is a hint, not a
        // guarantee: a 404 falls through to "missing" and we recreate.
        const observed = output?.sitekey
            ? yield* getWidget(output.accountId ?? accountId, output.sitekey)
            : undefined;
        if (!observed) {
            // Ensure — greenfield (or out-of-band delete): create with the
            // full desired body. Names are not unique so there is no
            // AlreadyExists race to tolerate.
            const created = yield* turnstile.createWidget({
                accountId,
                name,
                domains: news.domains,
                mode: news.mode,
                region: news.region,
                botFightMode: news.botFightMode,
                clearanceLevel: news.clearanceLevel,
                ephemeralId: news.ephemeralId,
                offlabel: news.offlabel,
            });
            return toAttributes(created, accountId);
        }
        // Sync — diff observed cloud state against desired; the update API
        // is a PUT that requires the full body, so send everything, but
        // skip the call entirely on a no-op.
        const desired = {
            name,
            domains: news.domains,
            mode: news.mode,
            botFightMode: news.botFightMode ?? observedBool(observed.botFightMode),
            clearanceLevel: news.clearanceLevel ?? observed.clearanceLevel,
            ephemeralId: news.ephemeralId ?? observedBool(observed.ephemeralId),
            offlabel: news.offlabel ?? observedBool(observed.offlabel),
        };
        const dirty = observed.name !== desired.name ||
            observed.mode !== desired.mode ||
            !sameDomains(observed.domains, desired.domains) ||
            (news.botFightMode !== undefined &&
                observed.botFightMode !== news.botFightMode) ||
            (news.clearanceLevel !== undefined &&
                observed.clearanceLevel !== news.clearanceLevel) ||
            (news.ephemeralId !== undefined &&
                observed.ephemeralId !== news.ephemeralId) ||
            (news.offlabel !== undefined && observed.offlabel !== news.offlabel);
        if (!dirty) {
            return toAttributes(observed, observed.accountId);
        }
        const updated = yield* turnstile.updateWidget({
            accountId: observed.accountId,
            sitekey: observed.sitekey,
            ...desired,
        });
        return toAttributes(updated, observed.accountId);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* turnstile
            .deleteWidget({
            accountId: output.accountId,
            sitekey: output.sitekey,
        })
            .pipe(Effect.catchTag("WidgetNotFound", () => Effect.void));
    }),
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Enumerate every widget in the account, paginating exhaustively.
        const pages = yield* turnstile.listWidgets
            .pages({ accountId })
            .pipe(Stream.runCollect);
        const sitekeys = Array.from(pages).flatMap((page) => (page.result ?? []).map((w) => w.sitekey));
        // The list payload omits the write-only `secret`, so hydrate each
        // widget via `getWidget` to produce the exact `read` Attributes
        // shape. A widget deleted between list and get surfaces as
        // `WidgetNotFound` (mapped to `undefined` by `getWidget`).
        const rows = yield* Effect.forEach(sitekeys, (sitekey) => getWidget(accountId, sitekey).pipe(Effect.map((w) => (w ? toAttributes(w, accountId) : undefined))), { concurrency: 10 });
        return rows.filter((row) => row !== undefined);
    }),
});
/**
 * Read a widget by sitekey, mapping "gone" (`WidgetNotFound`, Cloudflare
 * error code 10404) to `undefined`.
 */
const getWidget = (accountId, sitekey) => turnstile.getWidget({ accountId, sitekey }).pipe(Effect.map((w) => ({ ...w, accountId })), Effect.catchTag("WidgetNotFound", () => Effect.succeed(undefined)));
/**
 * Find a widget by exact name. Cloudflare's `filter` is a case-insensitive
 * substring match, so re-check exactly client-side. If several widgets carry
 * the same name, pick the oldest for determinism.
 */
const findByName = (accountId, name) => turnstile.listWidgets.items({ accountId, filter: `name:${name}` }).pipe(Stream.filter((w) => w.name === name), Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
    .sort((a, b) => a.createdOn.localeCompare(b.createdOn))
    .at(0)));
const createWidgetName = (id, name) => Effect.gen(function* () {
    return name ?? (yield* createPhysicalName({ id, lowercase: true }));
});
const observedBool = (value) => value ?? false;
const sameDomains = (observed, desired) => observed.length === desired.length &&
    [...observed].sort().join(",") === [...desired].sort().join(",");
const toAttributes = (widget, accountId) => ({
    sitekey: widget.sitekey,
    secret: Redacted.make(widget.secret),
    accountId,
    name: widget.name,
    // Distilled widens generated string enums to open unions (`string & {}`).
    domains: [...widget.domains],
    mode: widget.mode,
    region: widget.region,
    botFightMode: widget.botFightMode,
    clearanceLevel: widget.clearanceLevel,
    ephemeralId: widget.ephemeralId,
    offlabel: widget.offlabel,
    createdOn: widget.createdOn,
    modifiedOn: widget.modifiedOn,
});
//# sourceMappingURL=Widget.js.map