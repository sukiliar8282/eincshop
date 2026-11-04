import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Gateway.Configuration";
type TypeId = typeof TypeId;
/**
 * The Gateway account settings blocks this resource can manage. Only the
 * blocks you declare are patched (and captured for restore-on-destroy);
 * everything else on the account configuration is left untouched.
 */
export interface ConfigurationSettings {
    /** Activity logging master toggle for the account. */
    activityLog?: {
        enabled?: boolean;
    };
    /** Anti-virus scanning of file downloads/uploads. */
    antivirus?: {
        /** Scan on file download. */
        enabledDownloadPhase?: boolean;
        /** Scan on file upload. */
        enabledUploadPhase?: boolean;
        /** Block requests for files that cannot be scanned. */
        failClosed?: boolean;
        /** Block-page notification settings shown when a file is blocked. */
        notificationSettings?: {
            enabled?: boolean;
            includeContext?: boolean;
            msg?: string;
            supportUrl?: string;
        };
    };
    /** Custom block page configuration. */
    blockPage?: {
        /** Background color in hex (e.g. `#1f2937`). */
        backgroundColor?: string;
        /** Enable the custom block page (disabled shows the default page). */
        enabled?: boolean;
        /** Footer text. */
        footerText?: string;
        /** Header text. */
        headerText?: string;
        /** Include rule/policy context on the page. */
        includeContext?: boolean;
        /** URL of a logo image to display. */
        logoPath?: string;
        /** Admin email shown as a mailto: link. */
        mailtoAddress?: string;
        /** Subject prefilled in the mailto: link. */
        mailtoSubject?: string;
        /** Block page mode. */
        mode?: "" | "customized_block_page" | "redirect_uri";
        /** Block page name. */
        name?: string;
        /** Hide the Cloudflare footer. */
        suppressFooter?: boolean;
        /** Redirect URI when `mode` is `redirect_uri`. */
        targetUri?: string;
    };
    /** HTTP body scanning behaviour. */
    bodyScanning?: {
        inspectionMode?: "deep" | "shallow";
    };
    /** Clientless browser isolation. */
    browserIsolation?: {
        nonIdentityEnabled?: boolean;
        urlBrowserIsolationEnabled?: boolean;
    };
    /**
     * The Gateway-managed certificate used for TLS interception. Reference
     * a `Cloudflare.Gateway.Certificate`'s `certificateId` here.
     */
    certificate?: {
        id: string;
    };
    /** Match on both email aliases and the primary address. */
    extendedEmailMatching?: {
        enabled?: boolean;
    };
    /** FIPS-compliant TLS-only enforcement. */
    fips?: {
        tls?: boolean;
    };
    /** Host selector (egress by hostname) support. */
    hostSelector?: {
        enabled?: boolean;
    };
    /** Traffic inspection mode. */
    inspection?: {
        mode?: "static" | "dynamic";
    };
    /** Detect protocols on the initial bytes of a connection. */
    protocolDetection?: {
        enabled?: boolean;
    };
    /** File sandboxing. */
    sandbox?: {
        enabled?: boolean;
        fallbackAction?: "allow" | "block";
    };
    /** TLS decryption (required for HTTP inspection). */
    tlsDecrypt?: {
        enabled?: boolean;
    };
}
export type ConfigurationBlockKey = keyof ConfigurationSettings;
export interface ConfigurationProps {
    /**
     * The settings blocks to manage. Reconcile patches only the declared
     * blocks (Cloudflare PATCH semantics — undeclared blocks are never
     * touched), and destroy restores each declared block to the value it
     * had before Alchemy first managed it.
     */
    settings: ConfigurationSettings;
}
/**
 * A captured snapshot of the managed settings blocks as observed on
 * Cloudflare before Alchemy first patched them. `null` records a block
 * that was absent at capture time.
 */
export type ConfigurationSnapshot = Partial<Record<ConfigurationBlockKey, unknown>>;
export interface ConfigurationAttributes {
    /** Account that owns the Gateway configuration singleton. */
    accountId: string;
    /** The full observed Gateway settings after reconciliation. */
    settings: unknown;
    /**
     * The managed blocks' pre-management values, restored on destroy so
     * deleting the resource puts the account back the way it was found.
     */
    initialSettings: ConfigurationSnapshot;
    /** ISO8601 creation timestamp of the configuration. */
    createdAt: string | undefined;
    /** ISO8601 last-update timestamp of the configuration. */
    updatedAt: string | undefined;
}
export type Configuration = Resource<TypeId, ConfigurationProps, ConfigurationAttributes, never, Providers>;
/**
 * Manages the **singleton** Cloudflare Zero Trust **Gateway configuration**
 * for an account (`/accounts/{accountId}/gateway/configuration`) —
 * account-wide settings like activity logging, TLS decryption, the block
 * page, anti-virus scanning, and browser isolation.
 *
 * The singleton always exists, so reconcile patches only the settings
 * blocks you declare and never clobbers unmanaged blocks. The
 * pre-management value of each managed block is captured on first touch
 * and restored on destroy (capture-and-restore). Blocks that were unset
 * before Alchemy managed them cannot be restored (Cloudflare's API has no
 * way to unset a block) — destroy leaves the last managed value and logs
 * a warning.
 * ### Managing Gateway settings
 * **Example:** Enable activity logging and TLS decryption
 * ```typescript
 * yield* Cloudflare.Gateway.Configuration("Gateway", {
 *   settings: {
 *     activityLog: { enabled: true },
 *     tlsDecrypt: { enabled: true },
 *   },
 * });
 * ```
 *
 * **Example:** Custom block page
 * ```typescript
 * yield* Cloudflare.Gateway.Configuration("Gateway", {
 *   settings: {
 *     blockPage: {
 *       enabled: true,
 *       headerText: "Blocked by IT",
 *       footerText: "Contact support@example.com",
 *       backgroundColor: "#1f2937",
 *     },
 *   },
 * });
 * ```
 *
 * ### TLS interception
 * **Example:** Use a Gateway certificate for inspection
 * ```typescript
 * const cert = yield* Cloudflare.Gateway.Certificate("InspectionCa", {});
 * yield* Cloudflare.Gateway.Configuration("Gateway", {
 *   settings: {
 *     tlsDecrypt: { enabled: true },
 *     certificate: { id: cert.certificateId },
 *   },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/policies/gateway/
 *
 * @resource
 * @product Gateway
 * @category Cloudflare One (Zero Trust)
 */
export declare const Configuration: import("../../Resource.ts").ResourceClass<Configuration>;
/**
 * Returns true if the given value is a Configuration resource.
 */
export declare const isConfiguration: (value: unknown) => value is Configuration;
export declare const ConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<Configuration>, never, CloudflareEnvironment | zeroTrust.CloudflareOpContext>;
export {};
//# sourceMappingURL=Configuration.d.ts.map