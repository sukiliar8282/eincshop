import type * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface NamespaceProps {
    /**
     * Name of the namespace. Must be 3-64 characters, lowercase letters,
     * numbers, and hyphens. If omitted, a deterministic physical name is
     * generated. Changing the name replaces the namespace.
     */
    namespaceName?: string;
    /**
     * Name of the first database created in the namespace. Changing the
     * database name replaces the namespace.
     * @default "dev"
     */
    dbName?: string;
    /**
     * Administrator username for the namespace's initial database. Provide it
     * together with `adminUserPassword`, or set `manageAdminPassword` to have
     * Redshift store a generated password in Secrets Manager.
     */
    adminUsername?: string;
    /**
     * Administrator password. Ignored when `manageAdminPassword` is true.
     */
    adminUserPassword?: Redacted.Redacted<string>;
    /**
     * Let Redshift generate and manage the admin password in Secrets Manager.
     * The secret ARN is returned as `adminPasswordSecretArn`.
     * @default false
     */
    manageAdminPassword?: boolean;
    /**
     * Customer-managed KMS key ID used to encrypt the Secrets Manager secret
     * that holds the managed admin password.
     */
    adminPasswordSecretKmsKeyId?: string;
    /**
     * Customer-managed KMS key ID used to encrypt the namespace's data.
     * Changing the key replaces the namespace.
     * @default AWS-owned key
     */
    kmsKeyId?: string;
    /**
     * ARN of the IAM role set as the namespace's default role. Must also be a
     * member of `iamRoles`.
     */
    defaultIamRoleArn?: string;
    /**
     * ARNs of IAM roles associated with the namespace (used by COPY/UNLOAD and
     * other role-based features).
     */
    iamRoles?: string[];
    /**
     * Log types exported to CloudWatch Logs: `userlog`, `connectionlog`,
     * and/or `useractivitylog`.
     */
    logExports?: ("userlog" | "connectionlog" | "useractivitylog")[];
    /**
     * User-defined tags for the namespace.
     */
    tags?: Record<string, string>;
}
export interface Namespace extends Resource<"AWS.RedshiftServerless.Namespace", NamespaceProps, {
    /**
     * Name of the namespace.
     */
    namespaceName: string;
    /**
     * ARN of the namespace.
     */
    namespaceArn: string;
    /**
     * Unique ID of the namespace.
     */
    namespaceId: string;
    /**
     * Name of the first database created in the namespace.
     */
    dbName: string | undefined;
    /**
     * ARN of the Secrets Manager secret holding the admin password when
     * `manageAdminPassword` is enabled.
     */
    adminPasswordSecretArn: string | undefined;
    /**
     * Current namespace status (e.g. `"AVAILABLE"`).
     */
    status: string;
}, never, Providers> {
}
/**
 * An Amazon Redshift Serverless namespace — the storage-and-database half of
 * a serverless data warehouse.
 *
 * A namespace holds databases, schemas, tables, admin credentials, and IAM
 * roles. Compute is provided separately by a {@link Workgroup} that points at
 * the namespace. Creating a namespace is quick (~1 minute); the provider
 * waits (bounded) for it to become `AVAILABLE`.
 *
 * ### Creating a Namespace
 * **Example:** Inline Admin Credentials
 * ```typescript
 * const namespace = yield* RedshiftServerless.Namespace("Analytics", {
 *   dbName: "analytics",
 *   adminUsername: "admin",
 *   adminUserPassword: Redacted.make("SuperSecret123!"),
 * });
 * ```
 *
 * **Example:** Secrets-Manager-Managed Admin Password
 * ```typescript
 * const namespace = yield* RedshiftServerless.Namespace("Analytics", {
 *   dbName: "analytics",
 *   adminUsername: "admin",
 *   manageAdminPassword: true,
 * });
 * // namespace.adminPasswordSecretArn -> the generated secret's ARN
 * ```
 *
 * ### IAM Roles and Encryption
 * **Example:** Default Role and Customer KMS Key
 * ```typescript
 * const namespace = yield* RedshiftServerless.Namespace("Analytics", {
 *   dbName: "analytics",
 *   defaultIamRoleArn: role.roleArn,
 *   iamRoles: [role.roleArn],
 *   kmsKeyId: key.keyId,
 *   logExports: ["userlog", "connectionlog"],
 * });
 * ```
 *
 * @resource
 */
export declare const Namespace: import("../../Resource.ts").ResourceClass<Namespace>;
export declare const NamespaceProvider: () => import("effect/Layer").Layer<Provider.Provider<Namespace>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Namespace.d.ts.map