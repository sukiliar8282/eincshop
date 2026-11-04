import * as aiSecurity from "@distilled.cloud/cloudflare/ai-security";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const AiSecuritySettingsTypeId: "Cloudflare.AI.SecuritySettings";
type AiSecuritySettingsTypeId = typeof AiSecuritySettingsTypeId;
export type SecuritySettingsProps = {
    /**
     * Zone the AI Security settings belong to. Stable — changing the zone
     * triggers a replacement (the old zone's setting is restored to the
     * value it had before Alchemy managed it).
     */
    zoneId: string;
    /**
     * Whether AI Security for Apps (Firewall for AI) is enabled on the
     * zone. Mutable — toggled in place via PUT.
     *
     * @default false
     */
    enabled?: boolean;
};
export type SecuritySettingsAttributes = {
    /** Zone the AI Security settings belong to. */
    zoneId: string;
    /** Whether AI Security for Apps is currently enabled on the zone. */
    enabled: boolean;
    /**
     * The value `enabled` had before Alchemy first managed the setting.
     * Restored on destroy, so deleting the resource puts the zone back
     * the way it was found.
     */
    initialEnabled: boolean;
};
/**
 * Returns true if the given value is a SecuritySettings resource.
 */
export declare const isSecuritySettings: (value: unknown) => value is SecuritySettings;
export type SecuritySettings = Resource<AiSecuritySettingsTypeId, SecuritySettingsProps, SecuritySettingsAttributes, never, Providers>;
/**
 * AI Security for Apps (Firewall for AI) settings on a Cloudflare zone
 * (`/zones/{zone_id}/ai-security/settings`).
 *
 * The settings object is a zone singleton — it always exists and is never
 * created or deleted, only toggled. Reconcile PUTs the desired `enabled`
 * value when the observed value differs; destroy restores the value the
 * zone had before Alchemy first managed it.
 *
 * Declare at most one `SecuritySettings` per zone — two instances
 * managing the same zone would fight over the single underlying setting.
 *
 * AI Security for Apps is entitlement-gated: on accounts without the
 * feature every call fails with the typed `AiSecurityNotEntitled` error
 * (Cloudflare error code 13101).
 * ### Enabling AI Security
 * **Example:** Enable AI Security for Apps on a zone
 * ```typescript
 * const securitySettings = yield* Cloudflare.AI.SecuritySettings("AiSecurity", {
 *   zoneId: zone.zoneId,
 *   enabled: true,
 * });
 * ```
 *
 * **Example:** Pin AI Security off
 * ```typescript
 * yield* Cloudflare.AI.SecuritySettings("AiSecurity", {
 *   zoneId: zone.zoneId,
 *   enabled: false,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/waf/detections/firewall-for-ai/
 *
 * @resource
 * @product AI Security
 * @category Application Security
 */
export declare const SecuritySettings: import("../../Resource.ts").ResourceClass<SecuritySettings>;
export declare const SecuritySettingsProvider: () => import("effect/Layer").Layer<Provider.Provider<SecuritySettings>, never, CloudflareEnvironment | aiSecurity.CloudflareOpContext>;
export {};
//# sourceMappingURL=SecuritySettings.d.ts.map