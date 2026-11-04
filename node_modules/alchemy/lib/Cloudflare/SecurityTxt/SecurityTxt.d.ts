import * as securityTxt from "@distilled.cloud/cloudflare/security-txt";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.SecurityTxt.SecurityTxt";
type TypeId = typeof TypeId;
export type Props = {
    /**
     * Zone the security.txt file belongs to. Stable — changing the zone
     * triggers a replacement (the old zone's security.txt is deleted and a
     * new one is created on the new zone).
     */
    zoneId: string;
    /**
     * Whether the security.txt file is served at
     * `/.well-known/security.txt` on the zone. Mutable.
     *
     * @default true
     */
    enabled?: boolean;
    /**
     * Contact channels for security researchers — `mailto:` addresses,
     * `tel:` numbers, or HTTPS URLs (RFC 9116 `Contact` field). Required —
     * Cloudflare rejects a security.txt without it. Mutable.
     */
    contact: string[];
    /**
     * RFC 3339 timestamp after which the file's content should be
     * considered stale (RFC 9116 `Expires` field), e.g.
     * `2027-01-01T00:00:00Z`. Required — Cloudflare rejects a security.txt
     * without it. Mutable.
     */
    expires: string;
    /**
     * URLs of pages crediting security researchers (RFC 9116
     * `Acknowledgments` field). Mutable.
     */
    acknowledgments?: string[];
    /**
     * Canonical URLs where this security.txt file is served (RFC 9116
     * `Canonical` field). Mutable.
     */
    canonical?: string[];
    /**
     * URLs of encryption keys for secure communication (RFC 9116
     * `Encryption` field). Mutable.
     */
    encryption?: string[];
    /**
     * URLs of security-related job openings (RFC 9116 `Hiring` field).
     * Mutable.
     */
    hiring?: string[];
    /**
     * URLs of the vulnerability disclosure policy (RFC 9116 `Policy`
     * field). Mutable.
     */
    policy?: string[];
    /**
     * Comma-separated list of language tags the security team prefers
     * (RFC 9116 `Preferred-Languages` field), e.g. `"en, es"`. Mutable.
     */
    preferredLanguages?: string;
};
export type Attributes = {
    /** Zone the security.txt file belongs to. */
    zoneId: string;
    /** Whether the file is served at `/.well-known/security.txt`. */
    enabled: boolean;
    /** Contact channels for security researchers. */
    contact: string[];
    /** RFC 3339 timestamp after which the file is considered stale. */
    expires: string;
    /** URLs of pages crediting security researchers. */
    acknowledgments: string[] | undefined;
    /** Canonical URLs where this security.txt file is served. */
    canonical: string[] | undefined;
    /** URLs of encryption keys for secure communication. */
    encryption: string[] | undefined;
    /** URLs of security-related job openings. */
    hiring: string[] | undefined;
    /** URLs of the vulnerability disclosure policy. */
    policy: string[] | undefined;
    /** Comma-separated list of preferred language tags. */
    preferredLanguages: string | undefined;
};
export type SecurityTxt = Resource<TypeId, Props, Attributes, never, Providers>;
/**
 * A zone's `security.txt` file
 * (`/zones/{zone_id}/security-center/securitytxt`), served by the
 * Cloudflare edge at `https://<zone>/.well-known/security.txt` per
 * RFC 9116 so security researchers know how to report vulnerabilities.
 *
 * The file is a singleton per zone with true create/delete semantics:
 * creating the resource publishes the file, updating it is a full
 * replace of every field, and destroying it removes the file from the
 * zone entirely.
 *
 * Cloudflare requires the RFC 9116 mandatory fields — `contact` and
 * `expires` — on every write.
 * ### Publishing a security.txt
 * **Example:** Minimal security.txt
 * ```typescript
 * const zone = yield* Cloudflare.Zone.Zone("Site", { name: "example.com" });
 *
 * yield* Cloudflare.SecurityTxt.SecurityTxt("SecurityTxt", {
 *   zoneId: zone.zoneId,
 *   contact: ["mailto:security@example.com"],
 *   expires: "2027-01-01T00:00:00Z",
 * });
 * ```
 *
 * **Example:** Full security.txt with policy and acknowledgments
 * ```typescript
 * yield* Cloudflare.SecurityTxt.SecurityTxt("SecurityTxt", {
 *   zoneId: zone.zoneId,
 *   contact: ["mailto:security@example.com", "https://example.com/report"],
 *   expires: "2027-01-01T00:00:00Z",
 *   policy: ["https://example.com/security-policy"],
 *   acknowledgments: ["https://example.com/hall-of-fame"],
 *   encryption: ["https://example.com/pgp-key.txt"],
 *   preferredLanguages: "en, es",
 * });
 * ```
 *
 * ### Pausing without deleting
 * **Example:** Keep the configuration but stop serving the file
 * ```typescript
 * yield* Cloudflare.SecurityTxt.SecurityTxt("SecurityTxt", {
 *   zoneId: zone.zoneId,
 *   enabled: false,
 *   contact: ["mailto:security@example.com"],
 *   expires: "2027-01-01T00:00:00Z",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/security-center/infrastructure/security-file/
 *
 * @resource
 * @product Security.txt
 * @category Application Security
 */
export declare const SecurityTxt: import("../../Resource.ts").ResourceClass<SecurityTxt>;
/**
 * Returns true if the given value is a SecurityTxt resource.
 */
export declare const isSecurityTxt: (value: unknown) => value is SecurityTxt;
export declare const SecurityTxtProvider: () => import("effect/Layer").Layer<Provider.Provider<SecurityTxt>, never, CloudflareEnvironment | securityTxt.CloudflareOpContext>;
export {};
//# sourceMappingURL=SecurityTxt.d.ts.map