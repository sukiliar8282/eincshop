import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Effect from "effect/Effect";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
/**
 * Account-level Cloudflare Zero Trust organization settings — the team
 * domain, login branding, session lifetimes, WARP authentication toggle, etc.
 *
 * Wraps `PUT /accounts/{account_id}/access/organizations`.
 * @remarks
 * **This resource is a singleton.** Every Cloudflare account owns exactly one
 * Access Organization; you cannot create a second one and you cannot delete
 * the existing one without deleting the entire Cloudflare account. As a
 * result:
 *
 * - The `reconcile` lifecycle always **adopts** the existing organization on
 *   first deploy rather than failing on conflict.
 * - The `delete` lifecycle is a **no-op** that logs a warning. Removing the
 *   resource from your stack leaves the Cloudflare-side settings untouched.
 *
 * ### Configuring the organization
 * **Example:** Adopt and brand the organization
 * ```typescript
 * const org = yield* Cloudflare.Access.Organization("Org", {
 *   authDomain: "acme.cloudflareaccess.com",
 *   name: "Acme",
 *   sessionDuration: "24h",
 *   allowAuthenticateViaWarp: true,
 *   loginDesign: {
 *     logoPath: "https://acme.example/logo.png",
 *     backgroundColor: "#111111",
 *     textColor: "#ffffff",
 *   },
 * });
 * ```
 *
 * @resource
 * @product Access
 * @category Cloudflare One (Zero Trust)
 */
export const Organization = Resource("Cloudflare.Access.Organization", { aliases: ["Cloudflare.AccessOrganization"] });
export const OrganizationProvider = () => Provider.succeed(Organization, {
    nuke: { singleton: true },
    stables: ["accountId", "authDomain"],
    reconcile: Effect.fn(function* ({ news }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const desiredName = news.name ?? news.authDomain;
        const loginDesign = buildLoginDesign(news.loginDesign);
        const customPages = news.customPages
            ? {
                ...(news.customPages.forbidden !== undefined
                    ? { forbidden: news.customPages.forbidden }
                    : {}),
                ...(news.customPages.identityDenied !== undefined
                    ? { identityDenied: news.customPages.identityDenied }
                    : {}),
            }
            : undefined;
        // Observe — singleton lookup. The org always exists for any
        // account that has enabled Zero Trust; only a brand-new account
        // returns "missing".
        let observed = yield* observe();
        // Ensure — create on a fresh account. If a race or out-of-band
        // setup created it between the observe and create call, fall
        // back to update.
        if (!observed) {
            observed = yield* zeroTrust
                .createOrganizationForAccount({
                accountId,
                authDomain: news.authDomain,
                name: desiredName,
                ...(news.sessionDuration !== undefined
                    ? { sessionDuration: news.sessionDuration }
                    : {}),
                ...(news.allowAuthenticateViaWarp !== undefined
                    ? { allowAuthenticateViaWarp: news.allowAuthenticateViaWarp }
                    : {}),
                ...(news.isUiReadOnly !== undefined
                    ? { isUiReadOnly: news.isUiReadOnly }
                    : {}),
                ...(news.autoRedirectToIdentity !== undefined
                    ? { autoRedirectToIdentity: news.autoRedirectToIdentity }
                    : {}),
                ...(news.uiReadOnlyToggleReason !== undefined
                    ? { uiReadOnlyToggleReason: news.uiReadOnlyToggleReason }
                    : {}),
                ...(news.userSeatExpirationInactiveTime !== undefined
                    ? {
                        userSeatExpirationInactiveTime: news.userSeatExpirationInactiveTime,
                    }
                    : {}),
                ...(news.warpAuthSessionDuration !== undefined
                    ? { warpAuthSessionDuration: news.warpAuthSessionDuration }
                    : {}),
                ...(loginDesign ? { loginDesign } : {}),
            })
                .pipe(Effect.catchTag("OrganizationAlreadyExists", () => Effect.gen(function* () {
                const existing = yield* observe();
                if (existing)
                    return existing;
                return yield* Effect.fail(new Error("Cloudflare returned OrganizationAlreadyExists on createOrganizationForAccount but the org could not be observed afterwards"));
            })));
        }
        // Sync — Cloudflare's PUT is a true upsert. Always push so any
        // drift in observed vs desired converges in one call. Cheap and
        // idempotent.
        const updated = yield* zeroTrust.updateOrganizationForAccount({
            accountId,
            authDomain: news.authDomain,
            name: desiredName,
            ...(news.sessionDuration !== undefined
                ? { sessionDuration: news.sessionDuration }
                : {}),
            ...(news.allowAuthenticateViaWarp !== undefined
                ? { allowAuthenticateViaWarp: news.allowAuthenticateViaWarp }
                : {}),
            ...(news.isUiReadOnly !== undefined
                ? { isUiReadOnly: news.isUiReadOnly }
                : {}),
            ...(news.autoRedirectToIdentity !== undefined
                ? { autoRedirectToIdentity: news.autoRedirectToIdentity }
                : {}),
            ...(news.uiReadOnlyToggleReason !== undefined
                ? { uiReadOnlyToggleReason: news.uiReadOnlyToggleReason }
                : {}),
            ...(news.userSeatExpirationInactiveTime !== undefined
                ? {
                    userSeatExpirationInactiveTime: news.userSeatExpirationInactiveTime,
                }
                : {}),
            ...(news.warpAuthSessionDuration !== undefined
                ? { warpAuthSessionDuration: news.warpAuthSessionDuration }
                : {}),
            ...(loginDesign ? { loginDesign } : {}),
            ...(customPages ? { customPages } : {}),
        });
        return toAttrs(accountId, updated, news.authDomain, desiredName);
    }),
    delete: Effect.fn(function* () {
        yield* Effect.logWarning("Organization.delete is a no-op — the Cloudflare Access Organization is a singleton tied to the account and cannot be deleted without deleting the Cloudflare account itself.");
    }),
    read: Effect.fn(function* ({ olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const observed = yield* observe();
        if (!observed)
            return undefined;
        return toAttrs(accountId, observed, olds?.authDomain ?? observed.authDomain ?? "", olds?.name ?? observed.name ?? olds?.authDomain ?? "");
    }),
    // Account singleton: every Cloudflare account owns exactly one Access
    // Organization and there is no enumeration API. Read the single org via
    // the same `observe` path `read` uses and return the one-element array
    // (or `[]` when the account has never enabled Zero Trust). `observe`
    // already swallows the typed `OrganizationNotFound` error.
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const observed = yield* observe();
        if (!observed)
            return [];
        return [
            toAttrs(accountId, observed, observed.authDomain ?? "", observed.name ?? observed.authDomain ?? ""),
        ];
    }),
});
const observe = Effect.fn(function* () {
    const { accountId } = yield* yield* CloudflareEnvironment;
    return yield* zeroTrust.listOrganizationsForAccount({ accountId }).pipe(Effect.map((org) => {
        // listOrganizationsForAccount returns a single object (the
        // singleton org) under `result`; an account that has not yet
        // enabled Zero Trust returns a sparse object with no
        // `authDomain`. Treat that as "missing".
        const typed = org;
        return typed && typed.authDomain ? typed : undefined;
    }), Effect.catchTag("OrganizationNotFound", () => Effect.succeed(undefined)));
});
const toAttrs = (accountId, org, fallbackAuthDomain, fallbackName) => ({
    accountId,
    authDomain: org.authDomain ?? fallbackAuthDomain,
    name: org.name ?? fallbackName,
    sessionDuration: org.sessionDuration ?? undefined,
    allowAuthenticateViaWarp: org.allowAuthenticateViaWarp ?? undefined,
    isUiReadOnly: org.isUiReadOnly ?? undefined,
    autoRedirectToIdentity: org.autoRedirectToIdentity ?? undefined,
    uiReadOnlyToggleReason: org.uiReadOnlyToggleReason ?? undefined,
    userSeatExpirationInactiveTime: org.userSeatExpirationInactiveTime ?? undefined,
    warpAuthSessionDuration: org.warpAuthSessionDuration ?? undefined,
    loginDesign: observedLoginDesign(org.loginDesign),
    customPages: observedCustomPages(org.customPages),
});
const buildLoginDesign = (design) => {
    if (!design)
        return undefined;
    const out = {};
    if (design.backgroundColor !== undefined)
        out.backgroundColor = design.backgroundColor;
    if (design.footerText !== undefined)
        out.footerText = design.footerText;
    if (design.headerText !== undefined)
        out.headerText = design.headerText;
    if (design.logoPath !== undefined)
        out.logoPath = design.logoPath;
    if (design.textColor !== undefined)
        out.textColor = design.textColor;
    return out;
};
const observedLoginDesign = (design) => {
    if (!design)
        return undefined;
    return {
        backgroundColor: design.backgroundColor ?? undefined,
        footerText: design.footerText ?? undefined,
        headerText: design.headerText ?? undefined,
        logoPath: design.logoPath ?? undefined,
        textColor: design.textColor ?? undefined,
    };
};
const observedCustomPages = (pages) => {
    if (!pages)
        return undefined;
    return {
        forbidden: pages.forbidden ?? undefined,
        identityDenied: pages.identityDenied ?? undefined,
    };
};
//# sourceMappingURL=Organization.js.map