import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface InstanceProps {
    /**
     * Explicit instance ARN to adopt.
     */
    instanceArn?: string;
    /**
     * Friendly instance name.
     *
     * When `mode` is `"account"`, this name is passed to `CreateInstance`.
     * When `mode` is `"existing"`, it is used only for discovery.
     */
    name?: string;
    /**
     * How Alchemy should satisfy this resource.
     *
     * `existing` adopts a visible instance and fails if none is found.
     * `account` creates an account instance when no visible instance matches.
     *
     * Organization instances cannot currently be enabled via public API, so
     * organization-management-account deployments should use `existing`.
     *
     * @default "existing"
     */
    mode?: "existing" | "account";
}
export interface Instance extends Resource<"AWS.IdentityCenter.Instance", InstanceProps, {
    /** The ARN of the Identity Center instance. */
    instanceArn: string;
    /** The identity store backing the instance. */
    identityStoreId: string;
    /** The AWS account that owns the instance. */
    ownerAccountId: string | undefined;
    /** The friendly name of the instance, if set. */
    name: string | undefined;
    /** The current status of the instance (`ACTIVE`, ...). */
    status: string | undefined;
    /** Details when the instance is in a failed state. */
    statusReason: string | undefined;
    /** When the instance was created. */
    createdDate: Date | undefined;
    /** How the resource was satisfied: `existing` (adopted) or `account` (created). */
    mode: "existing" | "account";
}, never, Providers> {
}
/**
 * An IAM Identity Center instance visible to the current account.
 *
 * Use `mode: "existing"` to adopt a pre-enabled organization instance. Use
 * `mode: "account"` only for standalone or member-account account instances.
 * ### Discovering Existing Instances
 * **Example:** Adopt An Existing Instance
 * ```typescript
 * const instance = yield* Instance("IdentityCenter", {
 *   mode: "existing",
 * });
 * ```
 *
 * ### Creating Account Instances
 * **Example:** Create A Member Account Instance
 * ```typescript
 * const instance = yield* Instance("IdentityCenter", {
 *   mode: "account",
 *   name: "customer-a",
 * });
 * ```
 *
 * @resource
 */
export declare const Instance: import("../../Resource.ts").ResourceClass<Instance>;
export declare const InstanceProvider: () => import("effect/Layer").Layer<Provider.Provider<Instance>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Instance.d.ts.map