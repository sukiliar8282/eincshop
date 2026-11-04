import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface SyncConfigurationProps {
    /**
     * Branch of the repository that Git sync monitors, e.g. `main`.
     */
    branch: string;
    /**
     * Path to the configuration file (deployment file) in the repository,
     * e.g. `deployments/stack-deployment.yaml`.
     */
    configFile: string;
    /**
     * ID of the repository link Git sync monitors (from a `RepositoryLink`).
     */
    repositoryLinkId: string;
    /**
     * Name of the Amazon Web Services resource kept in sync — for
     * `CFN_STACK_SYNC` this is the CloudFormation stack name. Together with
     * `syncType` it identifies the sync configuration; changing it replaces
     * the configuration.
     */
    resourceName: string;
    /**
     * ARN of the IAM role that Git sync assumes to sync content to the
     * resource.
     */
    roleArn: string;
    /**
     * The sync type. Changing it replaces the configuration.
     * @default "CFN_STACK_SYNC"
     */
    syncType?: "CFN_STACK_SYNC";
    /**
     * Whether to publish deployment status (start/end) back to the provider
     * as commit statuses.
     * @default "ENABLED"
     */
    publishDeploymentStatus?: "ENABLED" | "DISABLED";
    /**
     * When to trigger a sync of the resource: on any change to the branch or
     * only when the tracked config file changes.
     * @default "ANY_CHANGE"
     */
    triggerResourceUpdateOn?: "ANY_CHANGE" | "FILE_CHANGE";
    /**
     * Whether Git sync comments sync status on pull requests against the
     * tracked branch.
     * @default "ENABLED"
     */
    pullRequestComment?: "ENABLED" | "DISABLED";
}
export interface SyncConfiguration extends Resource<"AWS.CodeConnections.SyncConfiguration", SyncConfigurationProps, {
    /** Name of the synced Amazon Web Services resource (e.g. stack name). */
    resourceName: string;
    /** The sync type. */
    syncType: string;
    /** Monitored branch. */
    branch: string;
    /** Path to the deployment file in the repository. */
    configFile: string;
    /** ID of the monitored repository link. */
    repositoryLinkId: string;
    /** Name of the linked repository. */
    repositoryName: string;
    /** Owner ID of the linked repository. */
    ownerId: string;
    /** The source provider (`GitHub`, `GitLab`, ...). */
    providerType: string;
    /** ARN of the IAM role Git sync assumes. */
    roleArn: string;
}, never, Providers> {
}
/**
 * An AWS CodeConnections sync configuration — connects a repository link's
 * branch + deployment file to an Amazon Web Services resource so Git sync
 * keeps the resource updated from the repository (CloudFormation stack
 * sync).
 * ### Syncing a CloudFormation Stack
 * **Example:** Stack Sync from a Repository Link
 * ```typescript
 * const sync = yield* CodeConnections.SyncConfiguration("StackSync", {
 *   branch: "main",
 *   configFile: "deployments/stack-deployment.yaml",
 *   repositoryLinkId: link.repositoryLinkId,
 *   resourceName: "my-stack",
 *   roleArn: gitSyncRole.roleArn,
 * });
 * ```
 *
 * **Example:** Sync Only on Deployment-File Changes
 * ```typescript
 * const sync = yield* CodeConnections.SyncConfiguration("StackSync", {
 *   branch: "main",
 *   configFile: "deployments/stack-deployment.yaml",
 *   repositoryLinkId: link.repositoryLinkId,
 *   resourceName: "my-stack",
 *   roleArn: gitSyncRole.roleArn,
 *   triggerResourceUpdateOn: "FILE_CHANGE",
 *   pullRequestComment: "DISABLED",
 * });
 * ```
 *
 * @resource
 */
export declare const SyncConfiguration: import("../../Resource.ts").ResourceClass<SyncConfiguration>;
export declare const SyncConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<SyncConfiguration>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=SyncConfiguration.d.ts.map