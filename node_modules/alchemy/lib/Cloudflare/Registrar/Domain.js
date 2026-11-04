import * as registrar from "@distilled.cloud/cloudflare/registrar";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.Registrar.Domain";
/**
 * The mutable Cloudflare Registrar settings (`auto_renew`, `locked`,
 * `privacy`) on a domain that is already registered with Cloudflare
 * Registrar.
 *
 * Domains cannot be registered or released through the API — purchases,
 * transfers, and renewals happen in the Cloudflare dashboard. This resource
 * therefore never creates or deletes a registration: reconcile adopts the
 * existing domain and converges only the settings you declare, and destroy
 * restores the settings the domain had before Alchemy first managed it
 * (captured as `initialSettings`). The domain itself always survives a
 * destroy.
 *
 * Settings you omit are left untouched, both during reconcile and during
 * the restore on destroy.
 *
 * Note: updating registrar settings requires an API token with Registrar
 * write permission; without it the update fails with the typed
 * `RegistrarUpdateNotAllowed` error.
 * ### Managing a registered domain
 * **Example:** Pin auto-renew and the transfer lock
 * ```typescript
 * yield* Cloudflare.Registrar.Domain("ApexDomain", {
 *   domainName: "example.com",
 *   autoRenew: true,
 *   locked: true,
 * });
 * ```
 *
 * **Example:** Enable WHOIS privacy only
 * ```typescript
 * // autoRenew and locked are omitted, so they are left untouched.
 * yield* Cloudflare.Registrar.Domain("ApexDomain", {
 *   domainName: "example.com",
 *   privacy: true,
 * });
 * ```
 *
 * ### Reading registration state
 * **Example:** Use the registration expiry downstream
 * ```typescript
 * const domain = yield* Cloudflare.Registrar.Domain("ApexDomain", {
 *   domainName: "example.com",
 *   autoRenew: true,
 * });
 * // domain.expiresAt, domain.currentRegistrar, domain.registryStatuses, ...
 * ```
 *
 * @see https://developers.cloudflare.com/registrar/
 *
 * @resource
 * @product Registrar
 * @category Domains & DNS
 */
export const Domain = Resource(TypeId);
/**
 * Returns true if the given value is a Domain resource.
 */
export const isDomain = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const DomainProvider = () => Provider.succeed(Domain, {
    // `delete` never releases the registration (it only restores settings), so
    // a domain can never be removed by teardown and would re-appear on every
    // `nuke` scan. Skip it in account-wide teardown.
    nuke: { skip: true },
    stables: ["domainName", "accountId", "initialSettings"],
    diff: Effect.fn(function* ({ olds, news, output }) {
        if (!isResolved(news))
            return undefined;
        // The domain name is the resource's identity.
        const oldDomainName = output?.domainName ?? olds?.domainName;
        if (oldDomainName !== undefined && oldDomainName !== news.domainName) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        const domainName = output?.domainName ?? olds?.domainName;
        if (!domainName)
            return undefined;
        const observed = yield* findDomain(acct, domainName);
        if (!observed)
            return undefined;
        // The underlying registration always pre-exists (it can only be
        // created in the dashboard) — there is no notion of creating it
        // ourselves, so a cold read adopts freely (never `Unowned`). The
        // observed settings at adoption time become the `initialSettings`
        // restored on destroy.
        const initialSettings = output !== undefined
            ? output.initialSettings
            : captureSettings(observed);
        return toAttributes(domainName, acct, observed, initialSettings);
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const domainName = news.domainName;
        // 1. Observe — the registration must already exist on the account;
        //    the API cannot create one.
        const observed = yield* findDomain(accountId, domainName);
        if (!observed) {
            return yield* Effect.fail(new Error(`Domain "${domainName}" is not registered with Cloudflare Registrar ` +
                `on account ${accountId}. Cloudflare.Registrar.Domain only manages ` +
                `settings on an existing registration — register or transfer the ` +
                `domain in the Cloudflare dashboard first.`));
        }
        // 2. Capture — the pre-management settings, restored on destroy.
        //    `output` (including an adoption read) already carries them;
        //    otherwise this is our first touch and the observed settings are
        //    the registration's originals.
        const initialSettings = output !== undefined
            ? output.initialSettings
            : captureSettings(observed);
        // 3. Sync — diff the observed settings against the declared props and
        //    PUT only on a delta. Omitted props are left untouched.
        const delta = settingsDelta(observed, news);
        if (delta === undefined) {
            return toAttributes(domainName, accountId, observed, initialSettings);
        }
        yield* registrar.putDomain({ accountId, domainName, ...delta });
        // 4. Return — re-read so attributes reflect live state; registrar
        //    updates can apply asynchronously, so overlay the desired
        //    settings on what we just put.
        const fresh = (yield* findDomain(accountId, domainName)) ?? observed;
        return toAttributes(domainName, accountId, fresh, initialSettings, news);
    }),
    delete: Effect.fn(function* ({ output }) {
        const { domainName, accountId, initialSettings } = output;
        // Never release the registration — destroy only restores the
        // settings the domain had before Alchemy managed it.
        const observed = yield* findDomain(accountId, domainName);
        // Domain gone (transferred out / expired out-of-band) — nothing to
        // restore.
        if (!observed)
            return;
        const delta = settingsDelta(observed, initialSettings);
        if (delta === undefined)
            return;
        yield* registrar.putDomain({ accountId, domainName, ...delta }).pipe(
        // Lost ownership between the observe and the put — gone is done.
        Effect.catchTag("RegistrarDomainNotOwned", () => Effect.void));
    }),
    // Account-scoped collection: enumerate every domain registered with
    // Cloudflare Registrar on the account, exhaustively paginated, and
    // hydrate each into the exact `read` Attributes shape. There is no prior
    // managed state for an enumerated domain, so — exactly like a cold
    // adoption read — the observed settings become the `initialSettings`.
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* registrar.listDomains.pages({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? [])
            .filter((domain) => typeof domain.name === "string")
            .map((domain) => toAttributes(domain.name, accountId, domain, captureSettings(domain))))));
    }),
});
/**
 * Find a registered domain by name on the account. `getDomain` answers 200
 * with a minimal availability stub (`{ name, supported_tld }`) for domains
 * that are *not* registered on the account, so scanning the typed list is
 * both the reliable existence check and the typed read.
 */
const findDomain = (accountId, domainName) => registrar.listDomains.items({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).find((domain) => domain.name === domainName)));
/** Snapshot the mutable registrar settings of an observed domain. */
const captureSettings = (observed) => ({
    autoRenew: observed.autoRenew ?? undefined,
    locked: observed.locked ?? undefined,
    privacy: observed.privacy ?? undefined,
});
/**
 * Diff observed settings against desired ones. Only fields that are
 * explicitly desired (not `undefined`) participate. Returns `undefined`
 * when nothing needs to change, so the PUT can be skipped entirely.
 */
const settingsDelta = (observed, desired) => {
    const delta = {};
    let dirty = false;
    if (desired.autoRenew !== undefined &&
        desired.autoRenew !== (observed.autoRenew ?? undefined)) {
        delta.autoRenew = desired.autoRenew;
        dirty = true;
    }
    if (desired.locked !== undefined &&
        desired.locked !== (observed.locked ?? undefined)) {
        delta.locked = desired.locked;
        dirty = true;
    }
    if (desired.privacy !== undefined &&
        desired.privacy !== (observed.privacy ?? undefined)) {
        delta.privacy = desired.privacy;
        dirty = true;
    }
    return dirty ? delta : undefined;
};
const toAttributes = (domainName, accountId, observed, initialSettings, desired) => ({
    domainName,
    accountId,
    // Registrar setting updates can apply asynchronously — overlay the
    // settings we just PUT over the (possibly lagging) observed values.
    autoRenew: desired?.autoRenew ?? observed.autoRenew ?? undefined,
    locked: desired?.locked ?? observed.locked ?? undefined,
    privacy: desired?.privacy ?? observed.privacy ?? undefined,
    available: observed.available ?? undefined,
    canRegister: observed.canRegister ?? undefined,
    currentRegistrar: observed.currentRegistrar ?? undefined,
    expiresAt: observed.expiresAt ?? undefined,
    createdAt: observed.createdAt ?? undefined,
    updatedAt: observed.updatedAt ?? undefined,
    registryStatuses: observed.registryStatuses ?? undefined,
    supportedTld: observed.supportedTld ?? undefined,
    initialSettings,
});
//# sourceMappingURL=Domain.js.map