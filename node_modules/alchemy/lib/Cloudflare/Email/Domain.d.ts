import * as emailSecurity from "@distilled.cloud/cloudflare/email-security";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const EmailSecurityDomainTypeId: "Cloudflare.Email.Domain";
type EmailSecurityDomainTypeId = typeof EmailSecurityDomainTypeId;
/**
 * Delivery modes a domain accepts messages through.
 */
export type DeliveryMode = "DIRECT" | "BCC" | "JOURNAL" | "API" | "RETRO_SCAN";
/**
 * Message dispositions that can be dropped before delivery.
 */
export type DropDisposition = "MALICIOUS" | "MALICIOUS-BEC" | "SUSPICIOUS" | "SPOOF" | "SPAM" | "BULK" | "ENCRYPTED" | "EXTERNAL" | "UNKNOWN" | "NONE";
export interface DomainProps {
    /**
     * The fully-qualified domain name of a domain that is **already
     * onboarded** to Email Security (via MX/BCC/journal or an API
     * integration). Domains cannot be created via the API — onboarding
     * happens in the Email Security dashboard. The domain name is the
     * resource's identity — changing it triggers a replacement (re-adopting
     * a different domain).
     */
    domain: string;
    /**
     * Delivery modes the domain accepts messages through.
     */
    allowedDeliveryModes?: DeliveryMode[];
    /**
     * Message dispositions that are dropped before delivery.
     */
    dropDispositions?: DropDisposition[];
    /**
     * IP/CIDR restrictions for inbound delivery.
     */
    ipRestrictions?: string[];
    /**
     * Folder messages are scanned in for API-deployed domains.
     */
    folder?: "AllItems" | "Inbox";
    /**
     * The API integration (e.g. Office 365) the domain is associated with.
     */
    integrationId?: string;
    /**
     * Number of message hops to look back when determining the original
     * sender.
     */
    lookbackHops?: number;
    /**
     * Require TLS for inbound mail.
     */
    requireTlsInbound?: boolean;
    /**
     * Require TLS for outbound (onward) delivery.
     */
    requireTlsOutbound?: boolean;
    /**
     * Onward delivery host for the domain.
     */
    transport?: string;
}
export interface DomainAttributes {
    /** Cloudflare-assigned domain identifier. */
    domainId: string;
    /** The account the domain belongs to. */
    accountId: string;
    /** The fully-qualified domain name. */
    domain: string;
    /** Domain authorization status, if reported. */
    authorization: {
        authorized: boolean;
        timestamp: string;
    } | undefined;
    /** Delivery modes the domain accepts messages through. */
    allowedDeliveryModes: DeliveryMode[];
    /** Message dispositions dropped before delivery. */
    dropDispositions: DropDisposition[];
    /** IP/CIDR restrictions for inbound delivery. */
    ipRestrictions: string[];
    /** Folder messages are scanned in for API-deployed domains. */
    folder: "AllItems" | "Inbox" | undefined;
    /** The API integration the domain is associated with, if any. */
    integrationId: string | undefined;
    /** Number of lookback hops, if configured. */
    lookbackHops: number | undefined;
    /** Whether TLS is required for inbound mail. */
    requireTlsInbound: boolean | undefined;
    /** Whether TLS is required for outbound delivery. */
    requireTlsOutbound: boolean | undefined;
    /** Onward delivery host. */
    transport: string;
    /** Office 365 tenant id for API-deployed domains, if any. */
    o365TenantId: string | undefined;
    /** Regions the domain's mail is processed in. */
    regions: string[];
    /** ISO8601 creation timestamp. */
    createdAt: string;
    /** ISO8601 last-modified timestamp, if the domain has been modified. */
    modifiedAt: string | undefined;
}
export type Domain = Resource<EmailSecurityDomainTypeId, DomainProps, DomainAttributes, never, Providers>;
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
export declare const Domain: import("../../Resource.ts").ResourceClass<Domain>;
/**
 * Returns true if the given value is an Domain resource.
 */
export declare const isDomain: (value: unknown) => value is Domain;
export declare const DomainProvider: () => import("effect/Layer").Layer<Provider.Provider<Domain>, never, CloudflareEnvironment | emailSecurity.CloudflareOpContext>;
export {};
//# sourceMappingURL=Domain.d.ts.map