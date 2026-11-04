import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Devices.Settings";
type TypeId = typeof TypeId;
/**
 * A snapshot of the account's WARP device settings, as observed on
 * Cloudflare. Captured before Alchemy first patches the singleton and
 * restored on destroy.
 */
export interface DeviceSettingsSnapshot {
    /** Time limit, in seconds, that a user can bypass WARP with an override code. */
    disableForTime?: number;
    /** Whether the external emergency disconnect feature is enabled. */
    externalEmergencySignalEnabled?: boolean;
    /** SHA-256 fingerprint pinning the emergency-signal server certificate. */
    externalEmergencySignalFingerprint?: string;
    /** Polling interval for the emergency disconnect signal (e.g. `"5m"`). */
    externalEmergencySignalInterval?: string;
    /** HTTPS URL the emergency disconnect signal is fetched from. */
    externalEmergencySignalUrl?: string;
    /** Whether Gateway proxy filtering on TCP is enabled. */
    gatewayProxyEnabled?: boolean;
    /** Whether Gateway proxy filtering on UDP is enabled. */
    gatewayUdpProxyEnabled?: boolean;
    /** Whether the Cloudflare-managed root certificate is installed on devices. */
    rootCertificateInstallationEnabled?: boolean;
    /** Whether CGNAT virtual IPv4 addressing is used. */
    useZtVirtualIp?: boolean;
}
export interface DeviceSettingsProps {
    /**
     * Sets the time limit, in seconds, that a user can use an override code
     * to bypass WARP. `0` disables override codes.
     */
    disableForTime?: number;
    /**
     * Controls whether the external emergency disconnect feature is enabled.
     */
    externalEmergencySignalEnabled?: boolean;
    /**
     * The SHA-256 fingerprint (64 hexadecimal characters) of the HTTPS
     * server certificate for {@link externalEmergencySignalUrl}. When set,
     * the WARP client uses it to verify the server's identity.
     */
    externalEmergencySignalFingerprint?: string;
    /**
     * The interval at which the WARP client fetches the emergency disconnect
     * signal, as a duration string (e.g. `"5m"`, `"2m30s"`, `"1h"`).
     * Minimum 30 seconds.
     */
    externalEmergencySignalInterval?: string;
    /**
     * The HTTPS URL from which to fetch the emergency disconnect signal.
     * Must use HTTPS with an IPv4 or IPv6 address as the host.
     */
    externalEmergencySignalUrl?: string;
    /**
     * Enable Gateway proxy filtering on TCP.
     */
    gatewayProxyEnabled?: boolean;
    /**
     * Enable Gateway proxy filtering on UDP.
     */
    gatewayUdpProxyEnabled?: boolean;
    /**
     * Enable installation of the Cloudflare-managed root certificate on
     * enrolled devices.
     */
    rootCertificateInstallationEnabled?: boolean;
    /**
     * Enable using CGNAT virtual IPv4 addressing.
     */
    useZtVirtualIp?: boolean;
}
export type DeviceSettingsAttributes = DeviceSettingsSnapshot & {
    /** Account that owns the device settings singleton. */
    accountId: string;
    /**
     * The settings the account had before Alchemy first patched them.
     * Restored (via PUT, which resets unspecified fields) on destroy, so
     * deleting the resource puts the account back the way it was found.
     */
    initialSettings: DeviceSettingsSnapshot;
};
export type DeviceSettings = Resource<TypeId, DeviceSettingsProps, DeviceSettingsAttributes, never, Providers>;
/**
 * Manages the **singleton** Cloudflare Zero Trust **device settings** for
 * an account (`/accounts/{accountId}/devices/settings`) — account-wide
 * WARP toggles like the Gateway TCP/UDP proxy, managed root certificate
 * installation, and CGNAT virtual IP.
 *
 * The singleton always exists, so reconcile patches only the declared
 * fields in place. The pre-management snapshot is captured on first touch
 * and restored on destroy (capture-and-restore), returning the account to
 * the state Alchemy found it in.
 * ### Managing device settings
 * **Example:** Enable the Gateway proxy
 * ```typescript
 * yield* Cloudflare.Devices.DeviceSettings("Devices", {
 *   gatewayProxyEnabled: true,
 *   gatewayUdpProxyEnabled: true,
 * });
 * ```
 *
 * **Example:** Allow one-hour WARP override codes
 * ```typescript
 * yield* Cloudflare.Devices.DeviceSettings("Devices", {
 *   disableForTime: 3600,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/connections/connect-devices/warp/
 *
 * @resource
 * @product Devices
 * @category Cloudflare One (Zero Trust)
 */
export declare const DeviceSettings: import("../../Resource.ts").ResourceClass<DeviceSettings>;
/**
 * Returns true if the given value is a DeviceSettings resource.
 */
export declare const isDeviceSettings: (value: unknown) => value is DeviceSettings;
export declare const DeviceSettingsProvider: () => import("effect/Layer").Layer<Provider.Provider<DeviceSettings>, never, CloudflareEnvironment | zeroTrust.CloudflareOpContext>;
export {};
//# sourceMappingURL=Settings.d.ts.map