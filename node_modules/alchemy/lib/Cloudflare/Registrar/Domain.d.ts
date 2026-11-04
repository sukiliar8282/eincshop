import * as registrar from "@distilled.cloud/cloudflare/registrar";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Registrar.Domain";
type TypeId = typeof TypeId;
/**
 * The mutable Cloudflare Registrar settings on a registered domain. These
 * are the only fields the Registrar API can change — everything else about
 * a registration (contacts, nameservers, renewal) is managed in the
 * Cloudflare dashboard.
 */
export interface DomainSettings {
    /**
     * Whether the registration auto-renews before it expires.
     */
    autoRenew?: boolean;
    /**
     * Whether the registrar transfer lock is in place (blocks transfers to
     * another registrar).
     */
    locked?: boolean;
    /**
     * Whether WHOIS information is redacted.
     */
    privacy?: boolean;
}
export interface DomainProps {
    /**
     * The fully-qualified domain name of a domain that is **already
     * registered** with Cloudflare Registrar on this account (e.g.
     * `example.com`). Domains cannot be registered or released via the API —
     * registration happens in the Cloudflare dashboard.
     *
     * The domain name is the resource's identity — changing it triggers a
     * replacement (the old domain's settings are restored to the values they
     * had before Alchemy managed them).
     */
    domainName: string;
    /**
     * Whether the registration auto-renews before it expires. Mutable —
     * updated in place. When omitted, the current value is left untouched.
     */
    autoRenew?: boolean;
    /**
     * Whether the registrar transfer lock is in place. Mutable — updated in
     * place. When omitted, the current value is left untouched.
     */
    locked?: boolean;
    /**
     * Whether WHOIS information is redacted. Mutable — updated in place.
     * When omitted, the current value is left untouched.
     */
    privacy?: boolean;
}
export interface DomainAttributes {
    /** The fully-qualified domain name. */
    domainName: string;
    /** Account the domain is registered under. */
    accountId: string;
    /** Whether the registration auto-renews. */
    autoRenew: boolean | undefined;
    /** Whether the registrar transfer lock is in place. */
    locked: boolean | undefined;
    /** Whether WHOIS information is redacted. */
    privacy: boolean | undefined;
    /** Whether the domain is available to register (always `false` for a registered domain). */
    available: boolean | undefined;
    /** Whether the domain can be registered through Cloudflare. */
    canRegister: boolean | undefined;
    /** The registrar currently sponsoring the domain (e.g. `Cloudflare`). */
    currentRegistrar: string | undefined;
    /** ISO8601 timestamp when the registration expires. */
    expiresAt: string | undefined;
    /** ISO8601 timestamp when the registration was created, if reported. */
    createdAt: string | undefined;
    /** ISO8601 timestamp when the registration was last updated, if reported. */
    updatedAt: string | undefined;
    /** Comma-separated EPP statuses (e.g. `clienttransferprohibited`). */
    registryStatuses: string | undefined;
    /** Whether the domain's TLD is supported by Cloudflare Registrar. */
    supportedTld: boolean | undefined;
    /**
     * The settings the domain had before Alchemy first managed it. Restored
     * on destroy, so deleting the resource puts the registration back the
     * way it was found — the domain itself is never released.
     */
    initialSettings: DomainSettings;
}
export type Domain = Resource<TypeId, DomainProps, DomainAttributes, never, Providers>;
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
export declare const Domain: import("../../Resource.ts").ResourceClass<Domain>;
/**
 * Returns true if the given value is a Domain resource.
 */
export declare const isDomain: (value: unknown) => value is Domain;
export declare const DomainProvider: () => import("effect/Layer").Layer<Provider.Provider<Domain>, never, CloudflareEnvironment | registrar.CloudflareOpContext>;
export {};
//# sourceMappingURL=Domain.d.ts.map