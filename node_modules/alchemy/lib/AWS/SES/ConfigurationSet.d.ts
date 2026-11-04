import * as sesv2 from "@distilled.cloud/aws/sesv2";
import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * Whether SES requires (`REQUIRE`) or merely prefers (`OPTIONAL`) a TLS
 * connection when delivering email through this configuration set.
 */
export type TlsPolicy = "REQUIRE" | "OPTIONAL";
/**
 * The reasons for which SES automatically adds recipients to the account
 * suppression list when sending through this configuration set.
 */
export type SuppressionListReason = "BOUNCE" | "COMPLAINT";
export interface ConfigurationSetTrackingSettings {
    /**
     * A custom domain — a verified subdomain you own, with a valid certificate —
     * that SES uses to host open- and click-tracking links for email sent
     * through this configuration set.
     *
     * Required: SES has no way to set an HTTPS policy for the default tracking
     * domain, so `httpsPolicy` is only meaningful alongside a custom domain.
     */
    customRedirectDomain: string;
    /**
     * Whether tracking links use HTTPS (`REQUIRE`), plain HTTP (`OPTIONAL`), or
     * HTTPS only for the open pixel (`REQUIRE_OPEN_ONLY`).
     */
    httpsPolicy?: sesv2.HttpsPolicy;
}
export interface ConfigurationSetVdmSettings {
    /**
     * Whether SES collects engagement (open/click) metrics for the Virtual
     * Deliverability Manager dashboard for email sent through this configuration
     * set.
     */
    dashboardEngagementMetrics?: sesv2.FeatureStatus;
    /**
     * Whether SES applies Guardian optimized shared delivery to email sent
     * through this configuration set.
     */
    guardianOptimizedSharedDelivery?: sesv2.FeatureStatus;
}
export interface ConfigurationSetProps {
    /**
     * The name of the configuration set. May contain letters, numbers, hyphens
     * and underscores, up to 64 characters. If omitted, a deterministic
     * physical name is generated from the app, stage, and logical ID.
     * Changing the name replaces the configuration set.
     */
    configurationSetName?: string;
    /**
     * Whether email sending through this configuration set is enabled.
     * @default true
     */
    sendingEnabled?: boolean;
    /**
     * Whether SES publishes reputation metrics (bounce and complaint rates)
     * for this configuration set to CloudWatch.
     * @default false
     */
    reputationMetricsEnabled?: boolean;
    /**
     * Whether SES requires a TLS connection when delivering email through
     * this configuration set. Messages are dropped when `REQUIRE` is set and
     * TLS cannot be established.
     * @default "OPTIONAL"
     */
    tlsPolicy?: TlsPolicy;
    /**
     * The maximum amount of time (5 minutes to 14 hours) that SES will attempt
     * delivery of email through this configuration set. Accepts any
     * `Duration.Input` (e.g. `"1 hour"`, `Duration.hours(1)`; a bare number
     * is milliseconds); the wire unit is whole seconds.
     */
    maxDelivery?: Duration.Input;
    /**
     * Which events cause SES to add a recipient to the account suppression
     * list when sending through this configuration set. Overrides the
     * account-level setting; leave undefined to inherit it.
     */
    suppressedReasons?: SuppressionListReason[];
    /**
     * Open- and click-tracking configuration. Leave undefined to keep whatever
     * SES currently has.
     *
     * Members cannot be unset once set: SES exposes no API to remove a custom
     * redirect domain, so dropping this prop keeps the current state rather
     * than restoring the default SES tracking domain.
     */
    tracking?: ConfigurationSetTrackingSettings;
    /**
     * Virtual Deliverability Manager configuration for this configuration set.
     * Requires account-level VDM to be enabled — see `SES.AccountSettings`.
     *
     * Members cannot be unset once set: dropping this prop keeps the current
     * state rather than clearing it. A member you do omit while managing its
     * sibling is preserved (SES replaces VdmOptions wholesale, so the
     * unmanaged member is backfilled from observed state).
     */
    vdm?: ConfigurationSetVdmSettings;
    /**
     * Tags to apply to the configuration set. Merged with internal Alchemy
     * tags.
     */
    tags?: Record<string, string>;
}
export interface ConfigurationSet extends Resource<"AWS.SES.ConfigurationSet", ConfigurationSetProps, {
    configurationSetName: string;
    configurationSetArn: string;
}, never, Providers> {
}
/**
 * An Amazon SES v2 configuration set — a named group of sending options
 * (TLS policy, reputation metrics, suppression overrides) that you apply to
 * outbound email, either per-message or as an identity's default.
 *
 * Attach event destinations with `SES.ConfigurationSetEventDestination` to
 * stream send/delivery/bounce/complaint events to SNS, EventBridge, or
 * CloudWatch.
 * ### Creating Configuration Sets
 * **Example:** Basic Configuration Set
 * ```typescript
 * import * as SES from "alchemy/AWS/SES";
 *
 * const configSet = yield* SES.ConfigurationSet("Default", {});
 * ```
 *
 * **Example:** Require TLS and Publish Reputation Metrics
 * ```typescript
 * const configSet = yield* SES.ConfigurationSet("Strict", {
 *   tlsPolicy: "REQUIRE",
 *   reputationMetricsEnabled: true,
 * });
 * ```
 *
 * **Example:** Suppress Bounces and Complaints
 * ```typescript
 * const configSet = yield* SES.ConfigurationSet("Suppressing", {
 *   suppressedReasons: ["BOUNCE", "COMPLAINT"],
 * });
 * ```
 *
 * ### Open and Click Tracking
 * **Example:** Host Tracking Links on Your Own Domain
 * ```typescript
 * // The redirect domain must be a verified subdomain you own with a valid
 * // certificate. Omit `tracking` entirely to keep SES's current setting.
 * const configSet = yield* SES.ConfigurationSet("Tracked", {
 *   tracking: {
 *     customRedirectDomain: "links.example.com",
 *     httpsPolicy: "REQUIRE",
 *   },
 * });
 * ```
 *
 * ### Virtual Deliverability Manager
 * **Example:** Collect Engagement Metrics for This Configuration Set
 * ```typescript
 * // Requires account-level VDM — see SES.AccountSettings.
 * const configSet = yield* SES.ConfigurationSet("Measured", {
 *   vdm: {
 *     dashboardEngagementMetrics: "ENABLED",
 *     guardianOptimizedSharedDelivery: "ENABLED",
 *   },
 * });
 * ```
 *
 * ### Event Destinations
 * **Example:** Stream Events to SNS
 * ```typescript
 * const topic = yield* SNS.Topic("EmailEvents", {});
 * const destination = yield* SES.ConfigurationSetEventDestination("ToSns", {
 *   configurationSetName: configSet.configurationSetName,
 *   matchingEventTypes: ["SEND", "DELIVERY", "BOUNCE", "COMPLAINT"],
 *   snsDestination: { topicArn: topic.topicArn },
 * });
 * ```
 *
 * @resource
 */
export declare const ConfigurationSet: import("../../Resource.ts").ResourceClass<ConfigurationSet>;
export declare const ConfigurationSetProvider: () => import("effect/Layer").Layer<Provider.Provider<ConfigurationSet>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ConfigurationSet.d.ts.map