import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Devices.PostureRule";
type TypeId = typeof TypeId;
/**
 * The type of device posture rule, e.g. `os_version`, `firewall`,
 * `disk_encryption`, or a third-party service-to-service integration type
 * like `crowdstrike_s2s` (which requires a posture integration's
 * `connectionId` in {@link DevicePostureRuleProps.input}).
 */
export type DevicePostureRuleType = zeroTrust.CreateDevicePostureRequest["type"];
/**
 * The per-type check definition for a posture rule. The accepted shape
 * depends on {@link DevicePostureRuleProps.type} — e.g. `os_version` takes
 * `{ operatingSystem, operator, version }`, `firewall` takes
 * `{ enabled, operatingSystem }`, `disk_encryption` takes
 * `{ checkDisks?, requireAll? }`.
 */
export type DevicePostureRuleInput = zeroTrust.CreateDevicePostureRequest["input"];
/**
 * Platform conditions that scope which devices run the rule.
 */
export type DevicePostureRuleMatch = zeroTrust.CreateDevicePostureRequest["match"];
export interface DevicePostureRuleProps {
    /**
     * Name of the device posture rule. If omitted, a unique name is
     * generated from the app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * The type of posture check (e.g. `os_version`, `firewall`,
     * `disk_encryption`, `crowdstrike_s2s`). Immutable — changing the type
     * triggers a replacement.
     */
    type: DevicePostureRuleType;
    /**
     * A description of the posture rule.
     */
    description?: string;
    /**
     * Polling frequency for the WARP client posture check (e.g. `"5m"`,
     * `"1h"`). Minimum `1m`.
     * @default "5m"
     */
    schedule?: string;
    /**
     * Expiration time for a posture check result (e.g. `"1h"`). If empty,
     * the result remains valid until overwritten by new data from the WARP
     * client.
     */
    expiration?: string;
    /**
     * The conditions (platforms) that a device must match for the rule to
     * run, e.g. `[{ platform: "mac" }]`.
     */
    match?: DevicePostureRuleMatch;
    /**
     * The per-type value to check against. Shape depends on {@link type}.
     */
    input?: DevicePostureRuleInput;
}
export type DevicePostureRuleAttributes = {
    /** API UUID of the posture rule. */
    postureRuleId: string;
    /** Account that owns the rule. */
    accountId: string;
    /** Observed rule name. */
    name: string;
    /** Observed rule type. */
    type: string;
    /** Observed description. */
    description: string | undefined;
    /** Observed polling schedule. */
    schedule: string | undefined;
    /** Observed result expiration. */
    expiration: string | undefined;
    /** Observed platform conditions. */
    match: {
        platform: string | undefined;
    }[] | undefined;
    /** Observed per-type check definition. */
    input: unknown;
};
export type DevicePostureRule = Resource<TypeId, DevicePostureRuleProps, DevicePostureRuleAttributes, never, Providers>;
/**
 * A Cloudflare Zero Trust **device posture rule** — a periodic check the
 * WARP client runs on enrolled devices (OS version, firewall status, disk
 * encryption, file presence, or a third-party security provider's
 * verdict). Posture results can then gate Access policies and Gateway
 * rules.
 *
 * Everything except `type` is mutable in place (full PUT). Changing
 * `type` replaces the rule.
 * ### Infrastructure-free checks
 * **Example:** Require a minimum Windows version
 * ```typescript
 * const rule = yield* Cloudflare.Devices.DevicePostureRule("WindowsOsVersion", {
 *   type: "os_version",
 *   description: "Require Windows 10.0.19045+",
 *   match: [{ platform: "windows" }],
 *   schedule: "5m",
 *   input: {
 *     operatingSystem: "windows",
 *     operator: ">=",
 *     version: "10.0.19045",
 *   },
 * });
 * ```
 *
 * **Example:** Require the OS firewall to be enabled
 * ```typescript
 * yield* Cloudflare.Devices.DevicePostureRule("Firewall", {
 *   type: "firewall",
 *   match: [{ platform: "windows" }, { platform: "mac" }],
 *   input: { enabled: true, operatingSystem: "windows" },
 * });
 * ```
 *
 * **Example:** Require disk encryption on all drives
 * ```typescript
 * yield* Cloudflare.Devices.DevicePostureRule("DiskEncryption", {
 *   type: "disk_encryption",
 *   match: [{ platform: "mac" }],
 *   input: { requireAll: true },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/identity/devices/
 *
 * @resource
 * @product Devices
 * @category Cloudflare One (Zero Trust)
 */
export declare const DevicePostureRule: import("../../Resource.ts").ResourceClass<DevicePostureRule>;
/**
 * Returns true if the given value is a DevicePostureRule resource.
 */
export declare const isDevicePostureRule: (value: unknown) => value is DevicePostureRule;
export declare const DevicePostureRuleProvider: () => import("effect/Layer").Layer<Provider.Provider<DevicePostureRule>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | zeroTrust.CloudflareOpContext>;
export {};
//# sourceMappingURL=PostureRule.d.ts.map