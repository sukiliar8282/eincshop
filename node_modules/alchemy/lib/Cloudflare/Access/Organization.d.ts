import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
export type OrganizationProps = {
    /**
     * The unique subdomain assigned to your Zero Trust organization, e.g.
     * `acme.cloudflareaccess.com`. Per-account this is functionally immutable —
     * Cloudflare allocates exactly one team domain when the account first
     * enables Zero Trust and changing it is a manual support operation.
     *
     * @see https://developers.cloudflare.com/cloudflare-one/setup/#1-create-a-team-name
     */
    authDomain: string;
    /**
     * Human-readable display name of your Zero Trust organization. Usually the
     * same as `authDomain`. Mutable.
     *
     * @see https://developers.cloudflare.com/api/operations/zero-trust-organization-update-your-zero-trust-organization
     */
    name?: string;
    /**
     * Default session lifetime for Access applications. Must be a Go duration
     * string (e.g. `30m`, `2h45m`, `24h`). Valid units: `ns`, `us`, `ms`, `s`,
     * `m`, `h`. Per-application settings override this default.
     *
     * @see https://developers.cloudflare.com/cloudflare-one/identity/users/session-management/
     */
    sessionDuration?: string;
    /**
     * When `true`, users may authenticate to Access applications via the WARP
     * client without going through the configured identity providers. Per-app
     * settings take precedence.
     *
     * @default false
     * @see https://developers.cloudflare.com/cloudflare-one/identity/devices/warp-authentication-identity/
     */
    allowAuthenticateViaWarp?: boolean;
    /**
     * When `true`, all Zero Trust settings in the Cloudflare dashboard are
     * read-only and may only be modified via the API or Terraform.
     *
     * @default false
     */
    isUiReadOnly?: boolean;
    /**
     * When `true`, users skip the identity provider selection step on login.
     * Only valid when exactly one IdP is configured (or one is set as default).
     *
     * @default false
     */
    autoRedirectToIdentity?: boolean;
    /**
     * Free-form description of why `isUiReadOnly` is toggled. Surfaced in the
     * Cloudflare dashboard.
     */
    uiReadOnlyToggleReason?: string;
    /**
     * Duration of user-seat inactivity before the user is removed as an active
     * seat and stops counting against the Teams seat quota. Go duration string.
     */
    userSeatExpirationInactiveTime?: string;
    /**
     * Lifetime of tokens issued by the WARP authentication flow. Go duration
     * string limited to `m` and `h` units, e.g. `30m` or `2h45m`.
     */
    warpAuthSessionDuration?: string;
    /**
     * Branding for the Access login screen.
     *
     * @see https://developers.cloudflare.com/cloudflare-one/identity/users/login-page/
     */
    loginDesign?: Organization.LoginDesign;
    /**
     * Pointers to custom HTML pages shown when Access blocks a request.
     *
     * @see https://developers.cloudflare.com/cloudflare-one/policies/access/custom-pages/
     */
    customPages?: Organization.CustomPages;
};
export declare namespace Organization {
    /**
     * Branding for the Access login screen.
     */
    interface LoginDesign {
        /** URL of the logo image rendered at the top of the login form. */
        logoPath?: string;
        /** CSS color for the header background, e.g. `#1a1a1a`. */
        headerBgColor?: string;
        /** CSS color for the page background. */
        backgroundColor?: string;
        /** CSS color for the body text. */
        textColor?: string;
        /** Markdown rendered at the top of the login form (legacy). */
        headerText?: string;
        /** Markdown rendered at the bottom of the login form. */
        footerText?: string;
    }
    /**
     * Pointers to custom HTML pages shown when Access denies a request.
     */
    interface CustomPages {
        /**
         * UUID of a custom forbidden page (created via the Access Custom Pages
         * API) shown when a policy denies access.
         */
        forbidden?: string;
        /**
         * UUID of a custom identity-denied page shown when the identity provider
         * rejects the user.
         */
        identityDenied?: string;
    }
}
export type Organization = Resource<"Cloudflare.Access.Organization", OrganizationProps, {
    /** Cloudflare account that owns the Zero Trust organization. */
    accountId: string;
    /** The Zero Trust team domain, e.g. `acme.cloudflareaccess.com`. */
    authDomain: string;
    /** Display name of the organization. */
    name: string;
    /** Default Access application session duration. */
    sessionDuration: string | undefined;
    /** WARP-as-IdP toggle observed on Cloudflare. */
    allowAuthenticateViaWarp: boolean | undefined;
    /** Dashboard read-only lock observed on Cloudflare. */
    isUiReadOnly: boolean | undefined;
    /** Skip-IdP-picker toggle observed on Cloudflare. */
    autoRedirectToIdentity: boolean | undefined;
    /** Free-form note explaining the `isUiReadOnly` setting. */
    uiReadOnlyToggleReason: string | undefined;
    /** User-seat inactivity expiration observed on Cloudflare. */
    userSeatExpirationInactiveTime: string | undefined;
    /** WARP authentication session duration observed on Cloudflare. */
    warpAuthSessionDuration: string | undefined;
    /** Login-page branding observed on Cloudflare. */
    loginDesign: Organization.LoginDesign | undefined;
    /** Custom-pages pointers observed on Cloudflare. */
    customPages: Organization.CustomPages | undefined;
}, never, Providers>;
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
export declare const Organization: import("../../Resource.ts").ResourceClass<Organization>;
export declare const OrganizationProvider: () => import("effect/Layer").Layer<Provider.Provider<Organization>, never, CloudflareEnvironment | zeroTrust.CloudflareOpContext>;
//# sourceMappingURL=Organization.d.ts.map