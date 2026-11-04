import * as lcc from "@distilled.cloud/cloudflare/leaked-credential-checks";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.LeakedCredentialCheck.LeakedCredentialCheck";
type TypeId = typeof TypeId;
export interface Props {
    /**
     * Zone whose Leaked Credential Checks setting is managed. Stable —
     * changing the zone triggers a replacement (the old zone's setting is
     * restored to the value it had before Alchemy managed it).
     */
    zoneId: string;
    /**
     * Whether Leaked Credential Checks are enabled on the zone. Mutable —
     * set in place via the API's POST upsert.
     * @default true
     */
    enabled?: boolean;
}
export interface Attributes {
    /** Zone the setting belongs to. */
    zoneId: string;
    /** Whether Leaked Credential Checks are currently enabled. */
    enabled: boolean;
    /**
     * The value the setting had before Alchemy first managed it. Restored
     * on destroy, so deleting the resource puts the zone back the way it
     * was found.
     */
    initialEnabled: boolean;
}
export type LeakedCredentialCheck = Resource<TypeId, Props, Attributes, never, Providers>;
/**
 * The Leaked Credential Checks setting of a Cloudflare zone
 * (`/zones/{zone_id}/leaked-credential-checks`).
 *
 * Leaked credential detection scans incoming requests for authentication
 * credentials previously seen in known breach compilations, populating the
 * `cf.waf.credential_check.*` ruleset fields that WAF rules can act on
 * (e.g. force a password reset on a leaked-credential login). The check is
 * a zone **singleton** — it always exists (default `enabled: false`), so
 * this resource never creates or deletes anything physical. Reconcile sets
 * the flag when the observed value differs from the desired one; destroy
 * restores the value the setting had before Alchemy first managed it
 * (captured as `initialEnabled`).
 *
 * Leaked-credential detection is available on all plans. Custom detection
 * locations (see {@link LeakedCredentialDetection}) are plan-gated
 * separately.
 *
 * Only one `LeakedCredentialCheck` resource per zone makes sense — two
 * instances managing the same zone would fight over the singleton.
 * ### Managing the check
 * **Example:** Enable Leaked Credential Checks on a zone
 * ```typescript
 * const zone = yield* Cloudflare.Zone.Zone("Site", { name: "example.com" });
 *
 * yield* Cloudflare.LeakedCredentialCheck.LeakedCredentialCheck("Lcc", {
 *   zoneId: zone.zoneId,
 * });
 * ```
 *
 * **Example:** Explicitly pin the check off
 * ```typescript
 * yield* Cloudflare.LeakedCredentialCheck.LeakedCredentialCheck("Lcc", {
 *   zoneId: zone.zoneId,
 *   enabled: false,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/waf/detections/leaked-credentials/
 *
 * @resource
 * @product Leaked Credential Checks
 * @category Application Security
 */
export declare const LeakedCredentialCheck: import("../../Resource.ts").ResourceClass<LeakedCredentialCheck>;
/**
 * Returns true if the given value is a LeakedCredentialCheck resource.
 */
export declare const isLeakedCredentialCheck: (value: unknown) => value is LeakedCredentialCheck;
export declare const LeakedCredentialCheckProvider: () => import("effect/Layer").Layer<Provider.Provider<LeakedCredentialCheck>, never, CloudflareEnvironment | lcc.CloudflareOpContext>;
export {};
//# sourceMappingURL=LeakedCredentialCheck.d.ts.map