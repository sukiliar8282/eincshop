import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface VaultNotificationConfigProps {
    /**
     * ARN of the SNS topic that Amazon S3 Glacier publishes job-completion
     * notifications to.
     */
    snsTopic: string;
    /**
     * Job-completion events to publish. Valid values are
     * `ArchiveRetrievalCompleted` and `InventoryRetrievalCompleted`.
     */
    events: string[];
}
export interface VaultProps {
    /**
     * Name of the vault. 1-255 characters; allowed characters are a-z, A-Z,
     * 0-9, `_` (underscore), `-` (hyphen), and `.` (period). Changing the
     * name replaces the vault.
     * @default ${app}-${stage}-${id}
     */
    vaultName?: string;
    /**
     * Notification configuration publishing job-completion events to an SNS
     * topic. Removing the prop deletes the vault's notification
     * configuration.
     */
    notificationConfig?: VaultNotificationConfigProps;
    /**
     * Vault access policy (a resource-based IAM policy document), provided
     * as a JSON string or a plain object. Removing the prop deletes the
     * vault's access policy.
     */
    accessPolicy?: string | Record<string, any>;
    /**
     * Vault lock policy (an IAM policy document enforcing compliance
     * controls), provided as a JSON string or a plain object. Setting it
     * initiates the vault lock, leaving it in the `InProgress` state — the
     * policy is in effect but can still be changed or removed for 24 hours.
     * Alchemy never calls `CompleteVaultLock`, so the lock is never made
     * immutable by this resource. Removing the prop aborts an in-progress
     * lock.
     */
    lockPolicy?: string | Record<string, any>;
    /**
     * Tags to apply to the vault (up to 10). Merged with internal Alchemy
     * tags.
     */
    tags?: Record<string, string>;
}
export interface Vault extends Resource<"AWS.Glacier.Vault", VaultProps, {
    /** The name of the vault. */
    vaultName: string;
    /** The ARN of the vault. */
    vaultArn: string;
    /** ISO-8601 timestamp of when the vault was created. */
    creationDate: string;
}, never, Providers> {
}
/**
 * An Amazon S3 Glacier vault — a container for archives in the original
 * (vault-based) S3 Glacier service.
 *
 * Vault creation is idempotent and free; storage is billed per archive.
 * A vault must be empty to be deleted, which is always the case for vaults
 * that only ever held configuration.
 * ### Creating Vaults
 * **Example:** Basic Vault
 * ```typescript
 * import * as Glacier from "alchemy/AWS/Glacier";
 *
 * const vault = yield* Glacier.Vault("Backups");
 * ```
 *
 * **Example:** Vault with Tags
 * ```typescript
 * const vault = yield* Glacier.Vault("Backups", {
 *   tags: { team: "storage" },
 * });
 * ```
 *
 * ### Notifications
 * **Example:** Publish job-completion events to SNS
 * ```typescript
 * const topic = yield* SNS.Topic("VaultEvents");
 * const vault = yield* Glacier.Vault("Backups", {
 *   notificationConfig: {
 *     snsTopic: topic.topicArn,
 *     events: ["ArchiveRetrievalCompleted", "InventoryRetrievalCompleted"],
 *   },
 * });
 * ```
 *
 * ### Access Control
 * **Example:** Vault access policy
 * ```typescript
 * const vault = yield* Glacier.Vault("Backups", {
 *   accessPolicy: {
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Sid: "deny-archive-deletes",
 *       Effect: "Deny",
 *       Principal: "*",
 *       Action: ["glacier:DeleteArchive"],
 *       Resource: ["arn:aws:glacier:us-east-1:123456789012:vaults/backups"],
 *     }],
 *   },
 * });
 * ```
 *
 * **Example:** Vault lock policy (left in-progress, never completed)
 * ```typescript
 * const vault = yield* Glacier.Vault("Compliance", {
 *   lockPolicy: {
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Sid: "deny-archive-deletes",
 *       Effect: "Deny",
 *       Principal: "*",
 *       Action: ["glacier:DeleteArchive"],
 *       Resource: ["arn:aws:glacier:us-east-1:123456789012:vaults/compliance"],
 *     }],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Vault: import("../../Resource.ts").ResourceClass<Vault>;
declare const GlacierVaultLockImmutable_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "GlacierVaultLockImmutable";
} & Readonly<A>;
/**
 * Raised when the desired `lockPolicy` differs from (or removes) a vault
 * lock that is already in the `Locked` state. A locked vault lock policy is
 * immutable — it can never be changed or removed.
 */
export declare class GlacierVaultLockImmutable extends GlacierVaultLockImmutable_base<{
    message: string;
}> {
}
declare const GlacierVaultIncomplete_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "GlacierVaultIncomplete";
} & Readonly<A>;
/**
 * Raised when DescribeVault returns a vault record missing its ARN or
 * creation date — never expected from the live API.
 */
export declare class GlacierVaultIncomplete extends GlacierVaultIncomplete_base<{
    message: string;
}> {
}
export declare const VaultProvider: () => import("effect/Layer").Layer<Provider.Provider<Vault>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Vault.d.ts.map