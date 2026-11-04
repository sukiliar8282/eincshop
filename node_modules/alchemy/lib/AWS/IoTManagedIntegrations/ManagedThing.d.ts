import * as mi from "@distilled.cloud/aws/iot-managed-integrations";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ManagedThingProps {
    /**
     * Role of the device in Managed integrations: a `CONTROLLER` onboards and
     * controls devices; a `DEVICE` is an endpoint. Changing the role replaces
     * the managed thing.
     */
    role: mi.Role;
    /**
     * Authentication material used to onboard the device (e.g. the payload of
     * a Wi-Fi setup or Zigbee QR bar code). This is a device-onboarding
     * credential — wrap it with `Redacted.make(...)`. Create-only — changing
     * it replaces the managed thing.
     */
    authenticationMaterial: Redacted.Redacted<string>;
    /**
     * Type of the authentication material.
     * E.g. `WIFI_SETUP_QR_BAR_CODE`, `ZIGBEE_QR_BAR_CODE`, `ZWAVE_QR_BAR_CODE`.
     * Create-only — changing it replaces the managed thing.
     */
    authenticationMaterialType: mi.AuthMaterialType;
    /**
     * Display name of the managed thing. If omitted, a unique name is generated
     * from the app, stage, and logical ID.
     */
    name?: string;
    /**
     * Identifier of the credential locker used by the managed thing.
     */
    credentialLockerId?: string;
    /**
     * Owner of the managed thing.
     */
    owner?: string;
    /**
     * Serial number of the device.
     */
    serialNumber?: string;
    /**
     * Brand of the device.
     */
    brand?: string;
    /**
     * Model of the device.
     */
    model?: string;
    /**
     * Classification of the managed thing.
     */
    classification?: string;
    /**
     * Capability report of the device.
     */
    capabilityReport?: mi.CapabilityReport;
    /**
     * Metadata key-value pairs for the managed thing.
     */
    metaData?: Record<string, string>;
    /**
     * User-defined tags to apply to the managed thing.
     */
    tags?: Record<string, string>;
}
export interface ManagedThing extends Resource<"AWS.IoTManagedIntegrations.ManagedThing", ManagedThingProps, {
    /** Service-generated identifier of the managed thing. */
    managedThingId: string;
    /** ARN of the managed thing. */
    managedThingArn: string;
    /** Display name of the managed thing. */
    managedThingName: string;
    /** Role of the device (CONTROLLER or DEVICE). */
    role: mi.Role;
    /** Provisioning status of the managed thing. */
    provisioningStatus: mi.ProvisioningStatus | undefined;
    /** Tags applied to the managed thing (user + internal). */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS IoT Managed Integrations managed thing — the cloud representation of
 * a device (or controller) onboarded through Managed integrations, carrying
 * its identity, protocol, and capability data model.
 *
 * Creating a managed thing requires real device onboarding material (e.g. a
 * Wi-Fi Simple Setup or Zigbee QR bar code payload). IoT Managed Integrations
 * is a regional service available in a limited set of regions (e.g.
 * `eu-west-1`, `ca-central-1`).
 *
 * ### Creating Managed Things
 * **Example:** Controller from a Wi-Fi Setup QR Code
 * ```typescript
 * const thing = yield* ManagedThing("Hub", {
 *   role: "CONTROLLER",
 *   authenticationMaterial: Redacted.make(wifiSetupQrCodePayload),
 *   authenticationMaterialType: "WIFI_SETUP_QR_BAR_CODE",
 * });
 * ```
 *
 * **Example:** Device with a Credential Locker
 * ```typescript
 * const locker = yield* CredentialLocker("DeviceCredentials", {});
 * const thing = yield* ManagedThing("Sensor", {
 *   role: "DEVICE",
 *   authenticationMaterial: Redacted.make(zigbeeQrCodePayload),
 *   authenticationMaterialType: "ZIGBEE_QR_BAR_CODE",
 *   credentialLockerId: locker.credentialLockerId,
 *   serialNumber: "SN-0001",
 * });
 * ```
 *
 * @resource
 */
export declare const ManagedThing: import("../../Resource.ts").ResourceClass<ManagedThing>;
export declare const ManagedThingProvider: () => import("effect/Layer").Layer<Provider.Provider<ManagedThing>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ManagedThing.d.ts.map