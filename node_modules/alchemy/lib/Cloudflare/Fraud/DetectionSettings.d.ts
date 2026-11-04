import * as fraud from "@distilled.cloud/cloudflare/fraud";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Fraud.DetectionSettings";
type TypeId = typeof TypeId;
/**
 * Criterion for classifying a login authentication outcome from the origin
 * response. Currently only status-code matching is supported.
 */
export interface AuthenticationCriteria {
    /**
     * How the origin response is matched. Only `"status_code"` is supported.
     */
    kind: "status_code";
    /**
     * HTTP status codes from the origin that satisfy this criterion
     * (e.g. `[200]` for success, `[401, 403]` for failure).
     */
    statusCodes?: number[];
}
/**
 * Configuration for classifying login authentication outcomes based on the
 * origin response. Requires `userProfiles` to be `"enabled"`.
 */
export interface AuthenticationSettings {
    /**
     * Origin responses that count as a successful authentication.
     */
    successCriteria?: AuthenticationCriteria;
    /**
     * Origin responses that count as a failed authentication.
     */
    failureCriteria?: AuthenticationCriteria;
}
/**
 * The writable fraud-detection settings of a zone. Only fields you
 * explicitly set are ever sent to Cloudflare — unset fields are left
 * untouched on the zone.
 */
export interface DetectionSettingsValues {
    /**
     * Whether Fraud User Profiles is enabled for the zone.
     *
     * Writing this field (even `"disabled"`) requires a fraud detection
     * subscription on the zone.
     * @default "disabled"
     */
    userProfiles?: "enabled" | "disabled";
    /**
     * Wirefilter expressions used to detect usernames in write HTTP
     * requests (maximum of 10). The full desired list is always sent, so
     * setting `[]` clears all expressions.
     */
    usernameExpressions?: string[];
    /**
     * Configuration for classifying login authentication outcomes based on
     * the origin response. Requires `userProfiles` to be `"enabled"`.
     */
    authenticationSettings?: AuthenticationSettings;
}
export interface DetectionSettingsProps extends DetectionSettingsValues {
    /**
     * Zone whose fraud-detection settings are managed. Stable — changing
     * the zone triggers a replacement (which re-adopts the new zone's
     * singleton and restores the old zone's snapshot).
     */
    zoneId: string;
}
export interface DetectionSettingsAttributes extends DetectionSettingsValues {
    /**
     * Zone that owns this fraud-detection configuration.
     */
    zoneId: string;
    /**
     * Snapshot of the writable settings observed **before** this resource
     * first wrote to the zone. `delete` restores these values for the
     * fields this resource managed.
     */
    initialSettings: DetectionSettingsValues;
}
export type DetectionSettings = Resource<TypeId, DetectionSettingsProps, DetectionSettingsAttributes, never, Providers>;
/**
 * The fraud-detection (Fraud User Profiles) settings of a Cloudflare zone
 * (`/zones/{zone_id}/fraud_detection/settings`) — a zone-scoped
 * **singleton**: every zone always has exactly one fraud-detection
 * settings object, so there is no create or delete on the Cloudflare
 * side. Reconciling this resource adopts the singleton and PUTs only the
 * fields you explicitly set, leaving every other field untouched.
 *
 * Fraud Detection is a beta, subscription-gated product: writing
 * `userProfiles`, non-empty `usernameExpressions`, or
 * `authenticationSettings` fails with `FraudDetectionNotEntitled` unless
 * the zone has a fraud detection subscription.
 *
 * On destroy, the resource restores the fields it managed to the values
 * observed before its first write (the `initialSettings` snapshot).
 * Fields that were never set by this resource are not touched.
 * `authenticationSettings` that did not exist before the first write
 * cannot be cleared and are left as-is.
 * ### Fraud User Profiles
 * **Example:** Enable user profiles with a username expression
 * ```typescript
 * yield* Cloudflare.Fraud.DetectionSettings("Fraud", {
 *   zoneId: zone.zoneId,
 *   userProfiles: "enabled",
 *   usernameExpressions: [
 *     'lookup_json_string(http.request.body.raw, "username")',
 *   ],
 * });
 * ```
 *
 * ### Authentication outcome classification
 * **Example:** Classify login success and failure by origin status code
 * ```typescript
 * yield* Cloudflare.Fraud.DetectionSettings("Fraud", {
 *   zoneId: zone.zoneId,
 *   userProfiles: "enabled",
 *   authenticationSettings: {
 *     successCriteria: { kind: "status_code", statusCodes: [200] },
 *     failureCriteria: { kind: "status_code", statusCodes: [401, 403] },
 *   },
 * });
 * ```
 *
 * ### Username expressions only
 * **Example:** Clear all username expressions
 * ```typescript
 * yield* Cloudflare.Fraud.DetectionSettings("Fraud", {
 *   zoneId: zone.zoneId,
 *   usernameExpressions: [],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/bots/additional-configurations/fraud-detection/
 *
 * @resource
 * @product Fraud Detection
 * @category Application Security
 */
export declare const DetectionSettings: import("../../Resource.ts").ResourceClass<DetectionSettings>;
/**
 * Returns true if the given value is a DetectionSettings resource.
 */
export declare const isDetectionSettings: (value: unknown) => value is DetectionSettings;
export declare const DetectionSettingsProvider: () => import("effect/Layer").Layer<Provider.Provider<DetectionSettings>, never, CloudflareEnvironment | fraud.CloudflareOpContext>;
export {};
//# sourceMappingURL=DetectionSettings.d.ts.map