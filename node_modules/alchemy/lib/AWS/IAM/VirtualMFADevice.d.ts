import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface VirtualMFADeviceProps {
    /**
     * Name of the virtual MFA device. If omitted, a deterministic name is generated.
     */
    virtualMFADeviceName?: string;
    /**
     * Optional IAM path prefix.
     * @default "/"
     */
    path?: string;
    /**
     * Optional user to activate the device for.
     */
    userName?: string;
    /**
     * First authentication code used when activating the device.
     */
    authenticationCode1?: string;
    /**
     * Second authentication code used when activating the device.
     */
    authenticationCode2?: string;
    /**
     * User-defined tags.
     */
    tags?: Record<string, string>;
}
export interface VirtualMFADevice extends Resource<"AWS.IAM.VirtualMFADevice", VirtualMFADeviceProps, {
    /** The serial number (ARN) of the virtual MFA device. */
    serialNumber: string;
    /** The user the device is enabled for, if activated. */
    userName: string | undefined;
    /** When the device was activated, if activated. */
    enableDate: Date | undefined;
    /** The base32 seed for configuring an authenticator app. AWS only returns it at creation. */
    base32StringSeed: Redacted.Redacted<Uint8Array<ArrayBufferLike>> | undefined;
    /** A QR-code PNG encoding the seed. AWS only returns it at creation. */
    qrCodePNG: Redacted.Redacted<Uint8Array<ArrayBufferLike>> | undefined;
    /** The tags applied to the device. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An IAM virtual MFA device.
 *
 * `VirtualMFADevice` creates a software MFA device and can optionally activate
 * it for a user during creation when the initial authentication codes are
 * provided.
 * ### Managing MFA Devices
 * **Example:** Create and Activate a Virtual MFA Device
 * ```typescript
 * const user = yield* User("AdminUser", {
 *   userName: "admin-user",
 * });
 *
 * const device = yield* VirtualMFADevice("AdminMfa", {
 *   userName: user.userName,
 *   authenticationCode1: "123456",
 *   authenticationCode2: "654321",
 * });
 * ```
 *
 * @resource
 */
export declare const VirtualMFADevice: import("../../Resource.ts").ResourceClass<VirtualMFADevice>;
export declare const VirtualMFADeviceProvider: () => import("effect/Layer").Layer<Provider.Provider<VirtualMFADevice>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=VirtualMFADevice.d.ts.map