import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface LandingZoneProps {
    /**
     * The landing zone version, e.g. `"3.3"`. Updating the version upgrades
     * the landing zone in place (an asynchronous operation that can take an
     * hour or more).
     */
    version: string;
    /**
     * The landing zone manifest JSON document — the full configuration of
     * the landing zone (governed regions, organization structure, logging
     * and access-management settings). See the AWS Control Tower User Guide
     * for the manifest schema.
     */
    manifest: Record<string, unknown>;
    /**
     * Remediation types enabled for the landing zone, e.g.
     * `["INHERITANCE_DRIFT"]`.
     */
    remediationTypes?: string[];
    /**
     * Tags to apply to the landing zone. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface LandingZone extends Resource<"AWS.ControlTower.LandingZone", LandingZoneProps, {
    /**
     * The unique identifier of the landing zone (its ARN).
     */
    landingZoneIdentifier: string;
    /**
     * The ARN of the landing zone.
     */
    landingZoneArn: string;
    /**
     * The deployed landing zone version.
     */
    version: string;
    /**
     * The landing zone deployment status (`ACTIVE`, `PROCESSING`,
     * `FAILED`).
     */
    status: string | undefined;
    /**
     * The most recent landing zone version available for upgrade.
     */
    latestAvailableVersion: string | undefined;
    /**
     * The landing zone drift status (`IN_SYNC` or `DRIFTED`).
     */
    driftStatus: string | undefined;
}, never, Providers> {
}
/**
 * An AWS Control Tower landing zone — the org-wide multi-account
 * environment (organization structure, governed regions, centralized
 * logging, and access management) that Control Tower governs.
 *
 * A landing zone is a singleton per AWS Organization and can only be
 * managed from the Organizations management account. Creating, updating,
 * and decommissioning a landing zone are asynchronous operations that can
 * take an hour or more.
 * ### Creating a Landing Zone
 * **Example:** Landing Zone from a manifest
 * ```typescript
 * import * as ControlTower from "alchemy/AWS/ControlTower";
 *
 * const landingZone = yield* ControlTower.LandingZone("LandingZone", {
 *   version: "3.3",
 *   manifest: {
 *     governedRegions: ["us-east-1", "us-west-2"],
 *     organizationStructure: {
 *       security: { name: "Security" },
 *       sandbox: { name: "Sandbox" },
 *     },
 *     centralizedLogging: {
 *       accountId: "111122223333",
 *       configurations: {
 *         loggingBucket: { retentionDays: 365 },
 *         accessLoggingBucket: { retentionDays: 365 },
 *       },
 *       enabled: true,
 *     },
 *     securityRoles: { accountId: "444455556666" },
 *     accessManagement: { enabled: true },
 *   },
 * });
 * ```
 *
 * ### Upgrading
 * **Example:** Upgrade the landing zone version
 * ```typescript
 * const landingZone = yield* ControlTower.LandingZone("LandingZone", {
 *   version: "3.3", // bump to upgrade in place
 *   manifest,
 * });
 * ```
 *
 * @resource
 */
export declare const LandingZone: import("../../Resource.ts").ResourceClass<LandingZone>;
declare const LandingZoneOperationFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "LandingZoneOperationFailed";
} & Readonly<A>;
/**
 * An asynchronous landing zone operation (CREATE / UPDATE / DELETE /
 * RESET) converged to the terminal `FAILED` status.
 */
export declare class LandingZoneOperationFailed extends LandingZoneOperationFailed_base<{
    readonly operationIdentifier: string;
    readonly status: string;
    readonly statusMessage: string | undefined;
}> {
}
export declare const LandingZoneProvider: () => import("effect/Layer").Layer<Provider.Provider<LandingZone>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=LandingZone.d.ts.map