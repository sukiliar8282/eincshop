import * as Effect from "effect/Effect";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import { Region } from "../Region.ts";
/** Pin an FMS admin-account operation to the us-east-1 endpoint. */
export declare const pinFms: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, Exclude<R, Region>>;
export interface AdminAccountProps {
    /**
     * The AWS account ID to designate as the AWS Firewall Manager administrator
     * account for the organization. Must be an account in the same AWS
     * Organization as the caller (which must be the Organizations management
     * account). If omitted, the caller's account is used.
     */
    adminAccount?: string;
}
/** @resource */
export interface AdminAccount extends Resource<"AWS.FMS.AdminAccount", AdminAccountProps, {
    /** The account designated as the FMS administrator. */
    adminAccount: string;
    /** Status of the FMS administrator IAM role (`READY` / `CREATING` / ...). */
    roleStatus: string | undefined;
}, never, Providers> {
}
/**
 * The AWS Firewall Manager administrator account — an organization-level
 * singleton that designates which account manages FMS security policies.
 *
 * :::caution
 * FMS requires the caller to be the AWS Organizations **management account**,
 * and the organization must have AWS Config enabled. On accounts that are not
 * an Organizations management account this resource fails at association time
 * with a typed `InvalidOperationException`.
 *
 * FMS admin-account APIs are served only from the us-east-1 endpoint; this
 * resource pins every control-plane call there regardless of the ambient
 * stack region.
 * :::
 *
 * This is a capture-and-restore singleton: FMS exposes no tags, so ownership is
 * tracked by Alchemy state — adopting a pre-existing admin account that Alchemy
 * did not create requires `--adopt`, and destroy disassociates the admin.
 *
 * ### Designating the FMS admin
 * **Example:** Designate the caller as the FMS admin
 * ```typescript
 * const admin = yield* FMS.AdminAccount("FmsAdmin", {});
 * ```
 *
 * **Example:** Designate a specific member account
 * ```typescript
 * const admin = yield* FMS.AdminAccount("FmsAdmin", {
 *   adminAccount: "123456789012",
 * });
 * ```
 */
declare const AdminAccountResource: import("../../Resource.ts").ResourceClass<AdminAccount>;
export { AdminAccountResource as AdminAccount };
export declare const AdminAccountProvider: () => import("effect/Layer").Layer<Provider.Provider<AdminAccount>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=AdminAccount.d.ts.map