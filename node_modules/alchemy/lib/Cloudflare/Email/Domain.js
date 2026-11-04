import * as emailSecurity from "@distilled.cloud/cloudflare/email-security";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const EmailSecurityDomainTypeId = "Cloudflare.Email.Domain";
/**
 * A Cloudflare Email Security (Area 1) domain's settings.
 *
 * Domains cannot be created via the API — they appear when the domain is
 * onboarded to Email Security (MX/BCC/journal or an API integration) in
 * the dashboard. This resource **adopts and configures** an existing
 * domain: `read` finds it by name and reports it as unowned, so taking it
 * under management is gated behind `--adopt` (or `adopt(true)`).
 *
 * :::warning
 * **Destroying this resource offboards the domain from Email Security**
 * (the underlying API call is `DELETE .../settings/domains/{id}`). Mail
 * flow for the domain is no longer scanned afterwards. Plan destroys with
 * care.
 * :::
 *
 * Requires the Email Security enterprise add-on; accounts without the
 * entitlement receive the typed `EmailSecurityNotEntitled` error.
 * ### Configuring a Domain
 * **Example:** Drop malicious mail before delivery
 * ```typescript
 * yield* Cloudflare.Email.Domain("MailDomain", {
 *   domain: "example.com",
 *   dropDispositions: ["MALICIOUS", "SPOOF"],
 * });
 * ```
 *
 * **Example:** Restrict inbound delivery and require TLS
 * ```typescript
 * yield* Cloudflare.Email.Domain("MailDomain", {
 *   domain: "example.com",
 *   ipRestrictions: ["203.0.113.0/24"],
 *   requireTlsInbound: true,
 *   requireTlsOutbound: true,
 *   transport: "mx.example.com",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/email-security/
 *
 * @resource
 * @product Email Security
 * @category Email
 */
export const Domain = Resource(EmailSecurityDomainTypeId, {
    aliases: ["Cloudflare.EmailSecurity.Domain"],
});
/**
 * Returns true if the given value is an Domain resource.
 */
export const isDomain = (value) => Predicate.hasProperty(value, "Type") &&
    value.Type === EmailSecurityDomainTypeId;
export const DomainProvider = () => Provider.succeed(Domain, {
    stables: ["domainId", "accountId", "domain", "o365TenantId", "createdAt"],
    diff: Effect.fn(function* ({ olds, news, output }) {
        if (!isResolved(news))
            return undefined;
        // The domain name is the resource's identity — changing it means
        // re-adopting a different onboarded domain.
        const oldDomain = output?.domain ?? olds?.domain;
        if (oldDomain !== undefined && oldDomain !== news.domain) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        // Owned path: refresh by the persisted domain id.
        if (output?.domainId) {
            const observed = yield* getDomain(acct, output.domainId);
            if (observed)
                return toAttributes(observed, acct);
        }
        // Cold lookup: the domain pre-exists (onboarded in the dashboard) and
        // carries no ownership markers — report it `Unowned` so taking it
        // under management is gated behind the adopt policy.
        const domain = output?.domain ?? olds?.domain;
        if (domain !== undefined) {
            const observed = yield* findByName(acct, domain);
            if (observed)
                return Unowned(toAttributes(observed, acct));
        }
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // 1. Observe — the domain must already be onboarded; the API cannot
        //    create one.
        let observed = output?.domainId
            ? yield* getDomain(accountId, output.domainId)
            : undefined;
        if (!observed) {
            observed = yield* findByName(accountId, news.domain);
        }
        if (!observed) {
            return yield* Effect.fail(new Error(`Domain "${news.domain}" is not onboarded to Email Security on ` +
                `account ${accountId}. Cloudflare.Email.Domain only ` +
                `manages settings on an existing domain — onboard the domain ` +
                `in the Email Security dashboard first.`));
        }
        // 2. Sync — diff observed settings against the declared props and
        //    patch only on a delta. Omitted props are left untouched.
        const delta = settingsDelta(observed, news);
        if (delta === undefined) {
            return toAttributes(observed, accountId);
        }
        const patched = yield* emailSecurity.patchSettingDomain({
            accountId,
            domainId: observed.id ?? "",
            ...delta,
        });
        return toAttributes(patched, accountId);
    }),
    delete: Effect.fn(function* ({ output }) {
        // DESTRUCTIVE: this offboards the domain from Email Security — its
        // mail flow is no longer scanned. Already-gone is success.
        yield* emailSecurity
            .deleteSettingDomain({
            accountId: output.accountId,
            domainId: output.domainId,
        })
            .pipe(Effect.catchTag("EmailSecurityDomainNotFound", () => Effect.void));
    }),
    // Account-scoped collection: enumerate every onboarded domain via the
    // paginated account-level list API and hydrate each into the exact
    // `read` Attributes shape. Accounts without the Email Security add-on
    // (`EmailSecurityNotEntitled`) or lacking access (`Forbidden`) have
    // nothing to enumerate — return [].
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* emailSecurity.listSettingDomains.pages({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((d) => toAttributes(d, accountId)))), Effect.catchTag(["EmailSecurityNotEntitled", "Forbidden"], () => Effect.succeed([])));
    }),
});
/**
 * Read a domain by id, mapping "gone" (`EmailSecurityDomainNotFound`,
 * HTTP 404) to `undefined`.
 */
const getDomain = (accountId, domainId) => emailSecurity.getSettingDomain({ accountId, domainId }).pipe(Effect.map((domain) => domain), Effect.catchTag("EmailSecurityDomainNotFound", () => Effect.succeed(undefined)));
/**
 * Find an onboarded domain by exact name.
 */
const findByName = (accountId, domain) => emailSecurity.listSettingDomains.items({ accountId, domain: [domain] }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).find((d) => d.domain === domain)));
const sameArray = (observed, desired) => {
    const a = [...(observed ?? [])].sort();
    const b = [...desired].sort();
    return a.length === b.length && a.join(",") === b.join(",");
};
/**
 * Diff observed domain settings against desired props. Only fields that
 * are explicitly declared (not `undefined`) participate. Returns
 * `undefined` when nothing needs to change, so the PATCH can be skipped
 * entirely. Inputs have been resolved to concrete values by Plan.
 */
const settingsDelta = (observed, news) => {
    const delta = {};
    let dirty = false;
    if (news.allowedDeliveryModes !== undefined &&
        !sameArray(observed.allowedDeliveryModes, news.allowedDeliveryModes)) {
        delta.allowedDeliveryModes = news.allowedDeliveryModes;
        dirty = true;
    }
    if (news.dropDispositions !== undefined &&
        !sameArray(observed.dropDispositions, news.dropDispositions)) {
        delta.dropDispositions = news.dropDispositions;
        dirty = true;
    }
    if (news.ipRestrictions !== undefined &&
        !sameArray(observed.ipRestrictions, news.ipRestrictions)) {
        delta.ipRestrictions = news.ipRestrictions;
        dirty = true;
    }
    if (news.folder !== undefined && (observed.folder ?? "") !== news.folder) {
        delta.folder = news.folder;
        dirty = true;
    }
    const integrationId = news.integrationId;
    if (integrationId !== undefined &&
        (observed.integrationId ?? "") !== integrationId) {
        delta.integrationId = integrationId;
        dirty = true;
    }
    if (news.lookbackHops !== undefined &&
        observed.lookbackHops !== news.lookbackHops) {
        delta.lookbackHops = news.lookbackHops;
        dirty = true;
    }
    if (news.requireTlsInbound !== undefined &&
        (observed.requireTlsInbound ?? false) !== news.requireTlsInbound) {
        delta.requireTlsInbound = news.requireTlsInbound;
        dirty = true;
    }
    if (news.requireTlsOutbound !== undefined &&
        (observed.requireTlsOutbound ?? false) !== news.requireTlsOutbound) {
        delta.requireTlsOutbound = news.requireTlsOutbound;
        dirty = true;
    }
    if (news.transport !== undefined &&
        (observed.transport ?? "") !== news.transport) {
        delta.transport = news.transport;
        dirty = true;
    }
    return dirty ? delta : undefined;
};
const toAttributes = (domain, accountId) => ({
    domainId: domain.id ?? "",
    accountId,
    domain: domain.domain ?? "",
    authorization: domain.authorization
        ? {
            authorized: domain.authorization.authorized,
            timestamp: domain.authorization.timestamp,
        }
        : undefined,
    allowedDeliveryModes: [
        ...(domain.allowedDeliveryModes ?? []),
    ],
    dropDispositions: [...(domain.dropDispositions ?? [])],
    ipRestrictions: [...(domain.ipRestrictions ?? [])],
    folder: (domain.folder ?? undefined),
    integrationId: domain.integrationId ?? undefined,
    lookbackHops: domain.lookbackHops ?? undefined,
    requireTlsInbound: domain.requireTlsInbound ?? undefined,
    requireTlsOutbound: domain.requireTlsOutbound ?? undefined,
    transport: domain.transport ?? "",
    o365TenantId: domain.o365TenantId ?? undefined,
    regions: [...(domain.regions ?? [])],
    createdAt: domain.createdAt ?? "",
    modifiedAt: domain.modifiedAt ?? undefined,
});
//# sourceMappingURL=Domain.js.map