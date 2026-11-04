import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface KeyModesOfUse {
    /**
     * Whether the key can be used to encrypt data.
     * @default false
     */
    encrypt?: boolean;
    /**
     * Whether the key can be used to decrypt data.
     * @default false
     */
    decrypt?: boolean;
    /**
     * Whether the key can be used to wrap other keys.
     * @default false
     */
    wrap?: boolean;
    /**
     * Whether the key can be used to unwrap other keys.
     * @default false
     */
    unwrap?: boolean;
    /**
     * Whether the key can be used to generate cryptograms and MACs.
     * @default false
     */
    generate?: boolean;
    /**
     * Whether the key can be used for signing.
     * @default false
     */
    sign?: boolean;
    /**
     * Whether the key can be used to verify signatures, cryptograms and MACs.
     * @default false
     */
    verify?: boolean;
    /**
     * Whether the key can be used to derive new keys.
     * @default false
     */
    deriveKey?: boolean;
    /**
     * Whether the key usage is unrestricted.
     * @default false
     */
    noRestrictions?: boolean;
}
export interface KeyAttributes {
    /**
     * The key algorithm to be used, e.g. `TDES_2KEY`, `AES_128`, `AES_256`,
     * `RSA_2048`, `ECC_NIST_P256`. Immutable — changing it replaces the key.
     */
    keyAlgorithm: string;
    /**
     * The type of key, e.g. `SYMMETRIC_KEY`, `ASYMMETRIC_KEY_PAIR`,
     * `PRIVATE_KEY`, `PUBLIC_KEY`. Immutable — changing it replaces the key.
     */
    keyClass: string;
    /**
     * The TR-31 cryptographic usage of the key, e.g.
     * `TR31_D0_SYMMETRIC_DATA_ENCRYPTION_KEY`, `TR31_M7_HMAC_KEY`,
     * `TR31_P0_PIN_ENCRYPTION_KEY`. Immutable — changing it replaces the key.
     */
    keyUsage: string;
    /**
     * The cryptographic operations the key may perform. Immutable — changing
     * any mode replaces the key.
     */
    keyModesOfUse: KeyModesOfUse;
}
export interface KeyProps {
    /**
     * The immutable cryptographic attributes of the key: algorithm, class,
     * usage and modes of use. Changing any of these replaces the key.
     */
    keyAttributes: KeyAttributes;
    /**
     * Whether the key can be exported out of the service (e.g. via TR-31/TR-34
     * key blocks). Immutable — changing it replaces the key.
     * @default false
     */
    exportable?: boolean;
    /**
     * Whether the key is enabled for cryptographic operations. Toggling this
     * calls StartKeyUsage/StopKeyUsage in place.
     * @default true
     */
    enabled?: boolean;
    /**
     * The algorithm used to compute the key check value, `CMAC` or
     * `ANSI_X9_24`. Immutable — changing it replaces the key.
     * @default ANSI_X9_24 for TDES keys, CMAC otherwise
     */
    keyCheckValueAlgorithm?: string;
    /**
     * For ECC key pairs used in ECDH key agreement, the usage bound to the
     * derived symmetric key. Immutable — changing it replaces the key.
     */
    deriveKeyUsage?: string;
    /**
     * The waiting period before a deleted key is permanently removed, e.g.
     * `"7 days"` or `Duration.days(7)` (`3` - `180` days; sent to the API as
     * whole days — a bare number is milliseconds). During the window the key
     * is `DELETE_PENDING` and can be restored.
     * @default "3 days"
     */
    deleteWindow?: Duration.Input;
    /**
     * Tags to apply to the key. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Key extends Resource<"AWS.PaymentCryptography.Key", KeyProps, {
    /**
     * ARN of the key.
     */
    keyArn: string;
    /**
     * Key state (e.g. `CREATE_COMPLETE`, `DELETE_PENDING`).
     */
    keyState: string;
    /**
     * Key check value (KCV) used to verify the key material.
     */
    keyCheckValue: string;
    /**
     * Whether the key is enabled for cryptographic operations.
     */
    enabled: boolean;
    /**
     * Whether the key material can be exported.
     */
    exportable: boolean;
}, never, Providers> {
}
/**
 * An AWS Payment Cryptography key — a managed cryptographic key with TR-31
 * attributes (algorithm, class, usage, modes of use) used for data
 * encryption, MAC generation/verification, and other payment-domain
 * cryptographic operations.
 *
 * The key ARN is auto-assigned by the service; attach an {@link Alias} for a
 * stable human-readable identifier. Deletion schedules the key for removal
 * after a waiting window (minimum 3 days) during which it can be restored.
 * ### Creating Keys
 * **Example:** Symmetric data-encryption key
 * ```typescript
 * import * as PaymentCryptography from "alchemy/AWS/PaymentCryptography";
 *
 * const key = yield* PaymentCryptography.Key("DataKey", {
 *   keyAttributes: {
 *     keyAlgorithm: "AES_128",
 *     keyClass: "SYMMETRIC_KEY",
 *     keyUsage: "TR31_D0_SYMMETRIC_DATA_ENCRYPTION_KEY",
 *     keyModesOfUse: { encrypt: true, decrypt: true, wrap: true, unwrap: true },
 *   },
 * });
 * ```
 *
 * **Example:** HMAC key for MAC generation and verification
 * ```typescript
 * const macKey = yield* PaymentCryptography.Key("MacKey", {
 *   keyAttributes: {
 *     keyAlgorithm: "HMAC_SHA256",
 *     keyClass: "SYMMETRIC_KEY",
 *     keyUsage: "TR31_M7_HMAC_KEY",
 *     keyModesOfUse: { generate: true, verify: true },
 *   },
 * });
 * ```
 *
 * ### Managing Key State
 * **Example:** Disable a key without deleting it
 * ```typescript
 * const key = yield* PaymentCryptography.Key("DataKey", {
 *   keyAttributes: { ... },
 *   enabled: false,
 * });
 * ```
 *
 * ### Using Keys at Runtime
 * **Example:** Encrypt data from a Lambda handler
 * ```typescript
 * // init
 * const encrypt = yield* PaymentCryptography.EncryptData(key);
 *
 * return {
 *   fetch: Effect.gen(function* () {
 *     // runtime — PlainText is hex-encoded
 *     const result = yield* encrypt({
 *       PlainText: "31323334353637383930313233343536",
 *       EncryptionAttributes: { Symmetric: { Mode: "CBC" } },
 *     });
 *     return HttpServerResponse.json({ cipherText: result.CipherText });
 *   }),
 * };
 * ```
 *
 * @resource
 */
export declare const Key: import("../../Resource.ts").ResourceClass<Key>;
export declare const KeyProvider: () => import("effect/Layer").Layer<Provider.Provider<Key>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Key.d.ts.map