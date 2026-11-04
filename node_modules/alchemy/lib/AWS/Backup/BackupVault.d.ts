import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { type PolicyDocument } from "../IAM/Policy.ts";
import type { Providers } from "../Providers.ts";
export interface BackupVaultProps {
    /**
     * Name of the backup vault. Must be between 2 and 50 characters and
     * contain only letters, numbers, hyphens, and underscores. If omitted, a
     * unique name is generated from the app, stage, and logical ID.
     *
     * Changing the name replaces the vault.
     */
    backupVaultName?: string;
    /**
     * ARN of the KMS key used to encrypt the recovery points stored in this
     * vault. If omitted, AWS Backup uses an AWS-owned key.
     *
     * The encryption key is fixed at creation — changing it replaces the vault.
     */
    encryptionKeyArn?: string;
    /**
     * Resource-based access policy attached to the vault. Provided as a
     * structured {@link PolicyDocument} (typed actions, drift-normalized on
     * re-deploy) or a raw JSON string escape hatch. Omit to leave the vault
     * without a resource policy.
     */
    accessPolicy?: PolicyDocument | string;
    /**
     * Tags to apply to the vault. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface BackupVault extends Resource<"AWS.Backup.BackupVault", BackupVaultProps, {
    /**
     * Name of the backup vault.
     */
    backupVaultName: string;
    /**
     * ARN of the backup vault.
     */
    backupVaultArn: string;
}, never, Providers> {
}
/**
 * An AWS Backup vault — a logical container that stores and organizes
 * recovery points created by backup jobs.
 *
 * A vault name is auto-generated from the app, stage, and logical ID unless
 * you provide one explicitly. Recovery points can optionally be encrypted
 * with a customer-managed KMS key, and access to the vault can be restricted
 * with a resource-based policy.
 *
 * ### Creating a Vault
 * **Example:** Basic Vault
 * ```typescript
 * import * as Backup from "alchemy/AWS/Backup";
 *
 * const vault = yield* Backup.BackupVault("AppBackups");
 * ```
 *
 * **Example:** Vault with a Customer-Managed KMS Key
 * ```typescript
 * const vault = yield* Backup.BackupVault("EncryptedBackups", {
 *   encryptionKeyArn: key.keyArn,
 * });
 * ```
 *
 * ### Vault Access Policy
 * **Example:** Deny deletion of recovery points
 * ```typescript
 * const vault = yield* Backup.BackupVault("LockedBackups", {
 *   accessPolicy: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Deny",
 *         Principal: { AWS: "*" },
 *         Action: ["backup:DeleteRecoveryPoint"],
 *         Resource: "*",
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const BackupVault: import("../../Resource.ts").ResourceClass<BackupVault>;
export declare const BackupVaultProvider: () => import("effect/Layer").Layer<Provider.Provider<BackupVault>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=BackupVault.d.ts.map