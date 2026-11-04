import * as inspector2 from "@distilled.cloud/aws/inspector2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/** CIS Benchmark hardening level the scan checks against. */
export type CisSecurityLevel = "LEVEL_1" | "LEVEL_2";
export interface CisScanConfigurationProps {
    /**
     * Name of the CIS scan configuration. If omitted, a unique name is
     * generated. Updatable in place — identity is the configuration's ARN.
     */
    scanName?: string;
    /**
     * The CIS Benchmark level the scan checks target instances against:
     * `LEVEL_1` (essential hardening) or `LEVEL_2` (defense in depth).
     * Updatable in place.
     */
    securityLevel: CisSecurityLevel;
    /**
     * When the scan runs: `{ oneTime: {} }`, or a `daily` / `weekly` /
     * `monthly` schedule with a start time, e.g.
     * `{ daily: { startTime: { timeOfDay: "02:00", timezone: "UTC" } } }`.
     * Updatable in place.
     */
    schedule: inspector2.Schedule;
    /**
     * The accounts (`["SELF"]` for the current account) and EC2 instance
     * resource tags the scan targets. Updatable in place.
     */
    targets: {
        /** Account ids to scan; `["SELF"]` targets the current account. */
        accountIds: string[];
        /**
         * EC2 instances to scan, selected by resource tag, e.g.
         * `{ Environment: ["production"] }`.
         */
        targetResourceTags: Record<string, string[]>;
    };
    /**
     * Tags applied to the scan configuration. Alchemy ownership tags are
     * merged in automatically.
     */
    tags?: Record<string, string>;
}
/** @resource */
export interface CisScanConfiguration extends Resource<"AWS.Inspector2.CisScanConfiguration", CisScanConfigurationProps, {
    /** ARN of the CIS scan configuration (its identity). */
    scanConfigurationArn: string;
    /** Name of the CIS scan configuration. */
    scanName: string;
    /** CIS Benchmark level the scan checks against. */
    securityLevel: CisSecurityLevel;
    /** Account that owns the scan configuration. */
    ownerId: string | undefined;
}, never, Providers> {
}
/**
 * An Amazon Inspector CIS scan configuration — schedules CIS Benchmark
 * scans of SSM-managed EC2 instances selected by resource tags. Name,
 * level, schedule, and targets are all updatable in place; identity is the
 * configuration's ARN.
 *
 * ### Scheduling CIS Scans
 * **Example:** Daily Level 1 scan of production instances
 * ```typescript
 * const scan = yield* AWS.Inspector2.CisScanConfiguration("NightlyCis", {
 *   securityLevel: "LEVEL_1",
 *   schedule: {
 *     daily: { startTime: { timeOfDay: "02:00", timezone: "UTC" } },
 *   },
 *   targets: {
 *     accountIds: ["SELF"],
 *     targetResourceTags: { Environment: ["production"] },
 *   },
 * });
 * ```
 *
 * **Example:** One-time Level 2 audit
 * ```typescript
 * const audit = yield* AWS.Inspector2.CisScanConfiguration("Level2Audit", {
 *   scanName: "level2-audit",
 *   securityLevel: "LEVEL_2",
 *   schedule: { oneTime: {} },
 *   targets: {
 *     accountIds: ["SELF"],
 *     targetResourceTags: { Audit: ["true"] },
 *   },
 * });
 * ```
 */
declare const CisScanConfigurationResource: import("../../Resource.ts").ResourceClass<CisScanConfiguration>;
export { CisScanConfigurationResource as CisScanConfiguration };
export declare const CisScanConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<CisScanConfiguration>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=CisScanConfiguration.d.ts.map