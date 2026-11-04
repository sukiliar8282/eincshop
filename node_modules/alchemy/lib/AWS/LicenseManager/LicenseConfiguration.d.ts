import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * Dimension used to track license inventory.
 */
export type LicenseCountingType = "vCPU" | "Instance" | "Core" | "Socket";
export interface LicenseConfigurationProps {
    /**
     * Name of the license configuration.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Description of the license configuration.
     */
    description?: string;
    /**
     * Dimension used to track the license inventory: `vCPU`, `Instance`,
     * `Core`, or `Socket`. Cannot be changed after creation — changing it
     * replaces the license configuration.
     */
    licenseCountingType: LicenseCountingType;
    /**
     * Number of licenses managed by the license configuration.
     */
    licenseCount?: number;
    /**
     * Whether the number of licenses is a hard limit. A hard limit blocks
     * new instance launches once the license count is consumed.
     * @default false
     */
    licenseCountHardLimit?: boolean;
    /**
     * License rules (e.g. `#allowedTenancy=EC2-DedicatedHost`,
     * `#licenseAffinityToHost=30`). The rules allowed depend on the
     * license counting type.
     */
    licenseRules?: string[];
    /**
     * When true, disassociates a resource from the license configuration
     * when the resource is no longer found (e.g. the instance was
     * terminated).
     * @default false
     */
    disassociateWhenNotFound?: boolean;
    /**
     * Tags to apply to the license configuration. Merged with internal
     * Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface LicenseConfiguration extends Resource<"AWS.LicenseManager.LicenseConfiguration", LicenseConfigurationProps, {
    /**
     * Unique ID of the license configuration, e.g. `lic-0123abcd...`.
     */
    licenseConfigurationId: string;
    /**
     * ARN of the license configuration.
     */
    licenseConfigurationArn: string;
    /**
     * Name of the license configuration.
     */
    name: string;
    /**
     * Dimension used to track the license inventory.
     */
    licenseCountingType: string;
}, never, Providers> {
}
/**
 * An AWS License Manager license configuration — an abstraction of a
 * customer license agreement that License Manager can track and enforce.
 *
 * A license configuration specifies the licensing dimension (vCPUs,
 * instances, cores, or sockets), an optional license count, and whether
 * the count is a hard limit that blocks new launches once consumed.
 * ### Creating License Configurations
 * **Example:** Track licenses by vCPU
 * ```typescript
 * import * as LicenseManager from "alchemy/AWS/LicenseManager";
 *
 * const licenses = yield* LicenseManager.LicenseConfiguration("Licenses", {
 *   licenseCountingType: "vCPU",
 * });
 * ```
 *
 * **Example:** Enforce a hard license limit
 * ```typescript
 * const licenses = yield* LicenseManager.LicenseConfiguration("Licenses", {
 *   licenseCountingType: "Instance",
 *   licenseCount: 10,
 *   licenseCountHardLimit: true,
 * });
 * ```
 *
 * **Example:** Socket licensing with dedicated-host rules
 * ```typescript
 * const licenses = yield* LicenseManager.LicenseConfiguration("Licenses", {
 *   licenseCountingType: "Socket",
 *   licenseCount: 4,
 *   licenseRules: ["#allowedTenancy=EC2-DedicatedHost"],
 *   description: "Oracle DB socket licenses",
 * });
 * ```
 *
 * @resource
 */
export declare const LicenseConfiguration: import("../../Resource.ts").ResourceClass<LicenseConfiguration>;
export declare const LicenseConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<LicenseConfiguration>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=LicenseConfiguration.d.ts.map