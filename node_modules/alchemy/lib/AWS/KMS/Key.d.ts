import * as kms from "@distilled.cloud/aws/kms";
import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { AccountID } from "../Environment.ts";
import type { PolicyDocument } from "../IAM/Policy.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type KeyId = string;
export type KeyArn = `arn:aws:kms:${RegionID}:${AccountID}:key/${KeyId}`;
export type { KeySpec, KeyState, KeyUsageType } from "@distilled.cloud/aws/kms";
export interface KeyProps {
    /**
     * Description for the KMS key.
     */
    description?: string;
    /**
     * Cryptographic operations that the key supports.
     * @default "ENCRYPT_DECRYPT"
     */
    keyUsage?: kms.KeyUsageType;
    /**
     * Type of key material for the KMS key.
     * @default "SYMMETRIC_DEFAULT"
     */
    keySpec?: kms.KeySpec;
    /**
     * Key policy, either as a structured {@link PolicyDocument} or a raw JSON
     * string (escape hatch). If omitted, AWS creates and manages the default
     * key policy.
     */
    policy?: PolicyDocument | string;
    /**
     * Whether to bypass KMS policy lockout safety checks when creating or updating
     * the key policy.
     * @default false
     */
    bypassPolicyLockoutSafetyCheck?: boolean;
    /**
     * Whether the KMS key is enabled.
     * @default true
     */
    enabled?: boolean;
    /**
     * Whether automatic key rotation is enabled.
     * @default false
     */
    enableKeyRotation?: boolean;
    /**
     * Rotation period when automatic key rotation is enabled. Accepts any
     * `Duration.Input` (e.g. `"90 days"`, `Duration.days(90)`; a bare number
     * is milliseconds); the wire unit is whole days.
     */
    rotationPeriod?: Duration.Input;
    /**
     * Whether to create a multi-region primary key.
     * @default false
     */
    multiRegion?: boolean;
    /**
     * Waiting period before AWS permanently deletes the key after destroy
     * schedules deletion. Accepts any `Duration.Input` (e.g. `"7 days"`,
     * `Duration.days(7)`; a bare number is milliseconds); the wire unit is
     * whole days.
     * @default 30 days
     */
    deletionWindow?: Duration.Input;
    /**
     * User-defined tags to apply to the key.
     */
    tags?: Record<string, string>;
}
export interface Key extends Resource<"AWS.KMS.Key", KeyProps, {
    keyId: KeyId;
    keyArn: KeyArn;
    description: string | undefined;
    keyUsage: kms.KeyUsageType;
    keySpec: kms.KeySpec;
    keyState: kms.KeyState | undefined;
    enabled: boolean;
    keyRotationEnabled: boolean | undefined;
    rotationPeriodInDays: number | undefined;
    multiRegion: boolean;
    policy: string | undefined;
    deletionWindowInDays: number;
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A customer managed AWS KMS key.
 *
 * ### Creating Keys
 * **Example:** Symmetric Encryption Key
 * ```typescript
 * import * as KMS from "alchemy/AWS/KMS";
 *
 * const key = yield* KMS.Key("AppKey", {
 *   description: "Application encryption key",
 *   enableKeyRotation: true,
 *   deletionWindow: "7 days",
 * });
 * ```
 *
 * ### Key Policies
 * **Example:** Key with Inline Policy
 * ```typescript
 * const key = yield* KMS.Key("PolicyKey", {
 *   policy: {
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Effect: "Allow",
 *       Principal: { AWS: "arn:aws:iam::123456789012:root" },
 *       Action: ["kms:*"],
 *       Resource: "*",
 *     }],
 *   },
 * });
 * ```
 *
 * ### Runtime Operations
 * Bind the KMS crypto operations to the key inside a Lambda function.
 * Each binding grants least-privilege IAM (the exact key ARN) and injects
 * the `KeyId` automatically.
 *
 * **Example:** Encrypt and Decrypt from a Lambda Function
 * ```typescript
 * // init
 * const key = yield* AWS.KMS.Key("AppKey");
 * const encrypt = yield* AWS.KMS.Encrypt(key);
 * const decrypt = yield* AWS.KMS.Decrypt(key);
 *
 * // runtime
 * const { CiphertextBlob } = yield* encrypt({
 *   Plaintext: new TextEncoder().encode("secret"),
 * });
 * const { Plaintext } = yield* decrypt({ CiphertextBlob });
 * ```
 *
 * **Example:** Envelope Encryption with a Data Key
 * ```typescript
 * // init
 * const generateDataKey = yield* AWS.KMS.GenerateDataKey(key);
 *
 * // runtime — encrypt locally with the plaintext key, store the blob
 * const { Plaintext, CiphertextBlob } = yield* generateDataKey({
 *   KeySpec: "AES_256",
 * });
 * ```
 */
export declare const Key: import("../../Resource.ts").ResourceClass<Key>;
export declare const KeyProvider: () => import("effect/Layer").Layer<Provider.Provider<Key>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Key.d.ts.map