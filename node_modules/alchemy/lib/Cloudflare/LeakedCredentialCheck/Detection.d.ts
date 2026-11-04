import * as lcc from "@distilled.cloud/cloudflare/leaked-credential-checks";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.LeakedCredentialCheck.Detection";
type TypeId = typeof TypeId;
export interface LeakedCredentialDetectionProps {
    /**
     * Zone the custom detection belongs to. Stable — moving a detection
     * between zones triggers a replacement.
     */
    zoneId: string;
    /**
     * Ruleset expression locating the username in the request, e.g.
     * `lookup_json_string(http.request.body.raw, "user")`. Mutable —
     * updated in place via PUT. At least one of `username`/`password`
     * should be set.
     */
    username?: string;
    /**
     * Ruleset expression locating the password in the request, e.g.
     * `lookup_json_string(http.request.body.raw, "secret")`. This is an
     * expression over the request (not a secret value). Mutable — updated
     * in place via PUT.
     */
    password?: string;
}
export interface LeakedCredentialDetectionAttributes {
    /** Cloudflare-assigned identifier of the custom detection. */
    detectionId: string;
    /** Zone the detection belongs to. */
    zoneId: string;
    /** The username-locating ruleset expression, if set. */
    username: string | undefined;
    /** The password-locating ruleset expression, if set. */
    password: string | undefined;
}
export type LeakedCredentialDetection = Resource<TypeId, LeakedCredentialDetectionProps, LeakedCredentialDetectionAttributes, never, Providers>;
/**
 * A custom detection location for Cloudflare Leaked Credential Checks
 * (`/zones/{zone_id}/leaked-credential-checks/detections`) — a pair of
 * ruleset expressions telling the WAF where to find the username and
 * password in your application's login requests, so credentials submitted
 * in non-standard payloads can still be checked against breach data.
 *
 * Requires Leaked Credential Checks to be **enabled** on the zone (see
 * {@link LeakedCredentialCheck}) — every detection operation fails with the
 * typed `LeakedCredentialChecksDisabled` error otherwise. The number of
 * custom detections is plan-gated (the free plan allows none — creation
 * fails with the typed `DetectionQuotaExceeded` error).
 *
 * Safety: detections carry no ownership markers. When there is no prior
 * state, `read` scans the zone for an existing detection with the same
 * expressions and reports it as `Unowned`, so the engine refuses to take
 * it over unless `--adopt` (or `adopt(true)`) is set.
 * ### Custom detection locations
 * **Example:** Detect credentials in a JSON login body
 * ```typescript
 * const check = yield* Cloudflare.LeakedCredentialCheck.LeakedCredentialCheck("Lcc", {
 *   zoneId: zone.zoneId,
 * });
 *
 * yield* Cloudflare.LeakedCredentialCheck.LeakedCredentialDetection("LoginBody", {
 *   // Reference the check's zoneId so the toggle deploys first.
 *   zoneId: check.zoneId,
 *   username: 'lookup_json_string(http.request.body.raw, "user")',
 *   password: 'lookup_json_string(http.request.body.raw, "secret")',
 * });
 * ```
 *
 * **Example:** Username-only detection
 * ```typescript
 * yield* Cloudflare.LeakedCredentialCheck.LeakedCredentialDetection("UsernameHeader",  {
 *   zoneId: check.zoneId,
 *   username: 'http.request.headers["x-username"][0]',
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/waf/detections/leaked-credentials/#custom-detection-locations
 *
 * @resource
 * @product Leaked Credential Checks
 * @category Application Security
 */
export declare const LeakedCredentialDetection: import("../../Resource.ts").ResourceClass<LeakedCredentialDetection>;
/**
 * Returns true if the given value is a LeakedCredentialDetection resource.
 */
export declare const isLeakedCredentialDetection: (value: unknown) => value is LeakedCredentialDetection;
export declare const LeakedCredentialDetectionProvider: () => import("effect/Layer").Layer<Provider.Provider<LeakedCredentialDetection>, never, CloudflareEnvironment | lcc.CloudflareOpContext>;
export {};
//# sourceMappingURL=Detection.d.ts.map