import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Devices.PostureIntegration";
type TypeId = typeof TypeId;
/**
 * The third-party provider behind the posture integration. Determines
 * which {@link DevicePostureIntegrationConfig} fields are required.
 */
export type DevicePostureIntegrationType = "workspace_one" | "crowdstrike_s2s" | "uptycs" | "intune" | "kolide" | "tanium_s2s" | "sentinelone_s2s" | "custom_s2s";
/**
 * Connection settings for the third-party posture provider. Which fields
 * are required depends on the integration `type`:
 *
 * - `workspace_one` — `apiUrl`, `authUrl`, `clientId`, `clientSecret`
 * - `crowdstrike_s2s` — `apiUrl`, `clientId`, `clientSecret`, `customerId`
 * - `uptycs` — `apiUrl`, `clientKey`, `clientSecret`, `customerId`
 * - `intune` — `clientId`, `clientSecret`, `customerId`
 * - `kolide` — `clientId`, `clientSecret`
 * - `tanium_s2s` — `apiUrl`, `clientSecret`, optional `accessClientId` /
 *   `accessClientSecret`
 * - `sentinelone_s2s` — `apiUrl`, `clientSecret`
 * - `custom_s2s` — `apiUrl`, `clientSecret`, `accessClientId`,
 *   `accessClientSecret`
 *
 * Secrets are write-only: Cloudflare never returns them on reads, so they
 * are carried forward from the desired state.
 */
export interface DevicePostureIntegrationConfig {
    /** The third-party API URL the integration polls. */
    apiUrl?: string;
    /** The OAuth authorization URL (workspace_one). */
    authUrl?: string;
    /** The OAuth client ID used to authenticate with the provider. */
    clientId?: string;
    /** The client key (uptycs). */
    clientKey?: string;
    /** The customer/tenant identifier (crowdstrike, uptycs, intune). */
    customerId?: string;
    /** The OAuth client secret. Write-only — never returned on reads. */
    clientSecret?: Redacted.Redacted<string>;
    /** Access service-token client ID guarding the custom endpoint. */
    accessClientId?: string;
    /** Access service-token client secret. Write-only. */
    accessClientSecret?: Redacted.Redacted<string>;
}
export interface DevicePostureIntegrationProps {
    /**
     * Name of the posture integration. If omitted, a unique name is
     * generated from the app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * The third-party provider type. Immutable — changing it triggers a
     * replacement.
     */
    type: DevicePostureIntegrationType;
    /**
     * The interval between each posture check against the third-party API.
     * Use `m` for minutes (e.g. `5m`) and `h` for hours (e.g. `12h`).
     */
    interval: string;
    /**
     * Connection settings for the provider (see
     * {@link DevicePostureIntegrationConfig} for the per-type field
     * requirements). Cloudflare validates the credentials against the live
     * third-party API on create/update.
     */
    config: DevicePostureIntegrationConfig;
}
export type DevicePostureIntegrationAttributes = {
    /** API UUID of the posture integration. */
    integrationId: string;
    /** Account that owns the integration. */
    accountId: string;
    /** Observed integration name. */
    name: string;
    /** The third-party provider type. */
    type: DevicePostureIntegrationType;
    /** Observed polling interval. */
    interval: string;
    /** Non-secret connection details as reported by Cloudflare. */
    config: {
        apiUrl: string | undefined;
        authUrl: string | undefined;
        clientId: string | undefined;
    };
};
export type DevicePostureIntegration = Resource<TypeId, DevicePostureIntegrationProps, DevicePostureIntegrationAttributes, never, Providers>;
/**
 * A Cloudflare Zero Trust **device posture integration** — a service-to-
 * service connection to a third-party endpoint security provider
 * (CrowdStrike, Intune, Kolide, Workspace ONE, ...) whose signals power
 * `*_s2s` device posture rules.
 *
 * Cloudflare validates the configured credentials against the live
 * provider API at create/update time, so a reachable third-party tenant
 * is required.
 * ### Creating a posture integration
 * **Example:** CrowdStrike Falcon
 * ```typescript
 * const falcon = yield* Cloudflare.Devices.DevicePostureIntegration("Falcon", {
 *   type: "crowdstrike_s2s",
 *   interval: "10m",
 *   config: {
 *     apiUrl: "https://api.crowdstrike.com",
 *     clientId: Alchemy.env("CROWDSTRIKE_CLIENT_ID"),
 *     clientSecret: Redacted.make(process.env.CROWDSTRIKE_SECRET!),
 *     customerId: "ccid-1234",
 *   },
 * });
 * ```
 *
 * **Example:** Custom service-to-service provider behind Access
 * ```typescript
 * const custom = yield* Cloudflare.Devices.DevicePostureIntegration("Custom", {
 *   type: "custom_s2s",
 *   interval: "30m",
 *   config: {
 *     apiUrl: "https://posture.example.com/check",
 *     clientSecret: Redacted.make(process.env.POSTURE_SECRET!),
 *     accessClientId: serviceToken.clientId,
 *     accessClientSecret: serviceToken.clientSecret,
 *   },
 * });
 * ```
 *
 * **Example:** Reference the integration from a posture rule
 * ```typescript
 * yield* Cloudflare.Devices.DevicePostureRule("FalconScore", {
 *   type: "crowdstrike_s2s",
 *   input: { connectionId: falcon.integrationId, os: "windows" },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/identity/devices/service-providers/
 *
 * @resource
 * @product Devices
 * @category Cloudflare One (Zero Trust)
 */
export declare const DevicePostureIntegration: import("../../Resource.ts").ResourceClass<DevicePostureIntegration>;
/**
 * Returns true if the given value is a DevicePostureIntegration resource.
 */
export declare const isDevicePostureIntegration: (value: unknown) => value is DevicePostureIntegration;
export declare const DevicePostureIntegrationProvider: () => import("effect/Layer").Layer<Provider.Provider<DevicePostureIntegration>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | zeroTrust.CloudflareOpContext>;
export {};
//# sourceMappingURL=PostureIntegration.d.ts.map