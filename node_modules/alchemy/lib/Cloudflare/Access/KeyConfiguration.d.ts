import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Access.KeyConfiguration";
type TypeId = typeof TypeId;
export type KeyConfigurationProps = {
    /**
     * The number of days between automatic Access service key rotations.
     * Cloudflare accepts values between 21 and 372 days.
     *
     * Mutable — converged in place via PUT.
     */
    keyRotationIntervalDays: number;
};
export type KeyConfigurationAttributes = {
    /** Cloudflare account the key configuration belongs to. */
    accountId: string;
    /** The number of days between key rotations. */
    keyRotationIntervalDays: number | undefined;
    /** The number of days until the next key rotation. */
    daysUntilNextRotation: number | undefined;
    /** The timestamp of the previous key rotation, if one has happened. */
    lastKeyRotationAt: string | undefined;
    /**
     * The rotation interval the account had before Alchemy first managed it.
     * Restored on destroy, so deleting the resource puts the account back
     * the way it was found. `undefined` when Cloudflare reported no interval
     * at adoption time — destroy then leaves the current interval in place.
     */
    initialKeyRotationIntervalDays: number | undefined;
};
export type KeyConfiguration = Resource<TypeId, KeyConfigurationProps, KeyConfigurationAttributes, never, Providers>;
/**
 * The Cloudflare Zero Trust Access service-key rotation configuration for an
 * account (`/accounts/{account_id}/access/keys`).
 *
 * The key configuration is an account singleton — it always exists, so this
 * resource never creates or deletes anything physical. Reconcile PUTs the
 * rotation interval when the observed value differs from the desired one;
 * destroy restores the interval the account had before Alchemy first managed
 * it (captured as `initialKeyRotationIntervalDays`).
 * ### Managing the rotation interval
 * **Example:** Rotate Access service keys every 30 days
 * ```typescript
 * const keys = yield* Cloudflare.Access.KeyConfiguration("Keys", {
 *   keyRotationIntervalDays: 30,
 * });
 * ```
 *
 * **Example:** Inspect rotation status
 * ```typescript
 * const keys = yield* Cloudflare.Access.KeyConfiguration("Keys", {
 *   keyRotationIntervalDays: 90,
 * });
 * // keys.daysUntilNextRotation, keys.lastKeyRotationAt
 * ```
 *
 * @see https://developers.cloudflare.com/api/resources/zero_trust/subresources/access/subresources/keys/
 *
 * @resource
 * @product Access
 * @category Cloudflare One (Zero Trust)
 */
export declare const KeyConfiguration: import("../../Resource.ts").ResourceClass<KeyConfiguration>;
/**
 * Returns true if the given value is an KeyConfiguration resource.
 */
export declare const isKeyConfiguration: (value: unknown) => value is KeyConfiguration;
export declare const KeyConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<KeyConfiguration>, never, CloudflareEnvironment | zeroTrust.CloudflareOpContext>;
export {};
//# sourceMappingURL=KeyConfiguration.d.ts.map