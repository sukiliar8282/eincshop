import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface RetentionConfigurationProps {
    /**
     * How long AWS Config retains your recorded configuration items. Accepts
     * any `Duration.Input` (e.g. `"90 days"`, `Duration.days(365)`); converted
     * to whole days on the wire (`RetentionPeriodInDays`). AWS accepts between
     * 30 days and 7 years (2557 days).
     */
    retentionPeriod: Duration.Input;
}
export interface RetentionConfiguration extends Resource<"AWS.Config.RetentionConfiguration", RetentionConfigurationProps, {
    /** Name of the retention configuration. AWS always names it `default`. */
    retentionConfigurationName: string;
    /** The retention period in whole days. */
    retentionPeriodInDays: number;
}, never, Providers> {
}
/**
 * The AWS Config retention configuration that controls how long AWS Config
 * retains your recorded configuration items.
 *
 * AWS allows only **one** retention configuration per account per region and
 * always names it `default` — treat this resource as an account-region
 * singleton.
 * ### Configuring Retention
 * **Example:** Retain configuration items for one year
 * ```typescript
 * import * as Config from "alchemy/AWS/Config";
 *
 * const retention = yield* Config.RetentionConfiguration("Retention", {
 *   retentionPeriod: "365 days",
 * });
 * ```
 *
 * **Example:** Minimum retention
 * ```typescript
 * const retention = yield* Config.RetentionConfiguration("Retention", {
 *   retentionPeriod: "30 days",
 * });
 * ```
 *
 * @resource
 */
export declare const RetentionConfiguration: import("../../Resource.ts").ResourceClass<RetentionConfiguration>;
export declare const RetentionConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<RetentionConfiguration>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=RetentionConfiguration.d.ts.map