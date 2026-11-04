import * as emailSecurity from "@distilled.cloud/cloudflare/email-security";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const EmailSecurityTrustedDomainTypeId = "Cloudflare.Email.TrustedDomain";
/**
 * A Cloudflare Email Security (Area 1) trusted domain — exempts a domain
 * from recently-registered and lookalike (similarity) detections.
 *
 * All fields are mutable in place. Requires the Email Security enterprise
 * add-on; accounts without the entitlement receive the typed
 * `EmailSecurityNotEntitled` error.
 * ### Trusting Domains
 * **Example:** Trust a partner domain with similar spelling
 * ```typescript
 * yield* Cloudflare.Email.TrustedDomain("PartnerLookalike", {
 *   pattern: "examp1e-partner.com",
 *   isSimilarity: true,
 *   comments: "legitimate partner domain",
 * });
 * ```
 *
 * **Example:** Trust a recently registered domain
 * ```typescript
 * yield* Cloudflare.Email.TrustedDomain("NewSubsidiary", {
 *   pattern: "brand-new-subsidiary.example",
 *   isRecent: true,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/email-security/
 *
 * @resource
 * @product Email Security
 * @category Email
 */
export const TrustedDomain = Resource(EmailSecurityTrustedDomainTypeId, { aliases: ["Cloudflare.EmailSecurity.TrustedDomain"] });
/**
 * Returns true if the given value is an TrustedDomain resource.
 */
export const isTrustedDomain = (value) => Predicate.hasProperty(value, "Type") &&
    value.Type === EmailSecurityTrustedDomainTypeId;
export const TrustedDomainProvider = () => Provider.succeed(TrustedDomain, {
    stables: ["trustedDomainId", "accountId", "createdAt"],
    // Account-scoped collection. Exhaustively paginate the account's trusted
    // domains and hydrate each into the `read` Attributes shape. Accounts
    // without the Email Security add-on surface the typed
    // `EmailSecurityNotEntitled` error — treat that as an empty enumeration.
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* emailSecurity.listSettingTrustedDomains
            .pages({ accountId })
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((entry) => toAttributes(entry, accountId)))), 
        // Email Security is a paid add-on gated by both account
        // entitlement and token scope: an unentitled account answers
        // `EmailSecurityNotEntitled`, while a credential lacking the
        // Email Security scope (e.g. Cloudflare OAuth) answers a bare
        // `Forbidden`. Neither can enumerate, so both mean "none
        // visible" — matching `Domain.list()`. Returning `[]` is the
        // safe direction for the callers of `list` (orphan detection
        // never deletes what it cannot see).
        Effect.catchTag(["EmailSecurityNotEntitled", "Forbidden"], () => Effect.succeed([])));
    }),
    read: Effect.fn(function* ({ output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        // Owned path: refresh by the persisted entry id.
        if (output?.trustedDomainId) {
            const observed = yield* getTrustedDomain(acct, output.trustedDomainId);
            if (observed)
                return toAttributes(observed, acct);
        }
        // Cold lookup: recover by pattern; matches are reported as `Unowned`
        // so takeover is gated behind the adopt policy.
        const pattern = output?.pattern ?? olds?.pattern;
        if (pattern !== undefined) {
            const observed = yield* findByPattern(acct, pattern);
            if (observed)
                return Unowned(toAttributes(observed, acct));
        }
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // 1. Observe — id hint first, then pattern scan.
        let observed = output?.trustedDomainId
            ? yield* getTrustedDomain(accountId, output.trustedDomainId)
            : undefined;
        if (!observed) {
            observed = yield* findByPattern(accountId, news.pattern);
        }
        // 2. Ensure — create when missing.
        if (!observed) {
            const created = yield* emailSecurity.createSettingTrustedDomain({
                accountId,
                pattern: news.pattern,
                isRecent: news.isRecent ?? false,
                isSimilarity: news.isSimilarity ?? false,
                isRegex: news.isRegex ?? false,
                comments: news.comments,
            });
            return toAttributes(created, accountId);
        }
        // 3. Sync — patch only on a delta.
        const dirty = (observed.pattern ?? "") !== news.pattern ||
            (observed.isRecent ?? false) !== (news.isRecent ?? false) ||
            (observed.isSimilarity ?? false) !== (news.isSimilarity ?? false) ||
            (observed.isRegex ?? false) !== (news.isRegex ?? false) ||
            (news.comments !== undefined &&
                (observed.comments ?? "") !== news.comments);
        if (!dirty) {
            return toAttributes(observed, accountId);
        }
        const patched = yield* emailSecurity.patchSettingTrustedDomain({
            accountId,
            trustedDomainId: observed.id ?? "",
            pattern: news.pattern,
            isRecent: news.isRecent ?? false,
            isSimilarity: news.isSimilarity ?? false,
            isRegex: news.isRegex ?? false,
            comments: news.comments,
        });
        return toAttributes(patched, accountId);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* emailSecurity
            .deleteSettingTrustedDomain({
            accountId: output.accountId,
            trustedDomainId: output.trustedDomainId,
        })
            .pipe(Effect.catchTag("TrustedDomainNotFound", () => Effect.void));
    }),
});
/**
 * Read a trusted domain by id, mapping "gone" (`TrustedDomainNotFound`,
 * HTTP 404) to `undefined`.
 */
const getTrustedDomain = (accountId, trustedDomainId) => emailSecurity.getSettingTrustedDomain({ accountId, trustedDomainId }).pipe(Effect.map((entry) => entry), Effect.catchTag("TrustedDomainNotFound", () => Effect.succeed(undefined)));
/**
 * Find a trusted domain by exact pattern. The `pattern` query filter is a
 * server-side hint; the exact match is re-checked client-side. Picks the
 * oldest match for determinism.
 */
const findByPattern = (accountId, pattern) => emailSecurity.listSettingTrustedDomains.items({ accountId, pattern }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
    .filter((entry) => entry.pattern === pattern)
    .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""))
    .at(0)));
const toAttributes = (entry, accountId) => ({
    trustedDomainId: entry.id ?? "",
    accountId,
    pattern: entry.pattern ?? "",
    isRecent: entry.isRecent ?? false,
    isSimilarity: entry.isSimilarity ?? false,
    isRegex: entry.isRegex ?? false,
    comments: entry.comments ?? undefined,
    createdAt: entry.createdAt ?? "",
    modifiedAt: entry.modifiedAt ?? undefined,
});
//# sourceMappingURL=TrustedDomain.js.map