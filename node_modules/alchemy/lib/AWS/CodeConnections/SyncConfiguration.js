import * as codeconnections from "@distilled.cloud/aws/codeconnections";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
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
export const SyncConfiguration = Resource("AWS.CodeConnections.SyncConfiguration");
const DEFAULT_SYNC_TYPE = "CFN_STACK_SYNC";
export const SyncConfigurationProvider = () => Provider.effect(SyncConfiguration, Effect.gen(function* () {
    /**
     * Read a sync configuration by its identity (sync type + resource
     * name); a missing configuration reads as absent.
     */
    const getByIdentity = Effect.fn(function* (syncType, resourceName) {
        const response = yield* codeconnections
            .getSyncConfiguration({
            SyncType: syncType,
            ResourceName: resourceName,
        })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        return response?.SyncConfiguration;
    });
    const toAttrs = (config) => ({
        resourceName: config.ResourceName,
        syncType: config.SyncType,
        branch: config.Branch,
        configFile: config.ConfigFile ?? "",
        repositoryLinkId: config.RepositoryLinkId,
        repositoryName: config.RepositoryName,
        ownerId: config.OwnerId,
        providerType: config.ProviderType ?? "",
        roleArn: config.RoleArn,
    });
    return {
        stables: [
            "resourceName",
            "syncType",
            "repositoryName",
            "ownerId",
            "providerType",
        ],
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return undefined;
            // (syncType, resourceName) is the configuration's identity —
            // replace on change. Everything else is mutable via
            // UpdateSyncConfiguration.
            if ((news?.resourceName ?? undefined) !==
                (olds?.resourceName ?? undefined) ||
                (news?.syncType ?? DEFAULT_SYNC_TYPE) !==
                    (olds?.syncType ?? DEFAULT_SYNC_TYPE)) {
                return { action: "replace" };
            }
        }),
        // Sync configurations carry no tags — ownership is keyed by the
        // (syncType, resourceName) identity the caller declares, so `read`
        // returns the observed state as owned.
        read: Effect.fn(function* ({ olds, output }) {
            const syncType = output?.syncType ?? olds?.syncType ?? DEFAULT_SYNC_TYPE;
            const resourceName = output?.resourceName ?? olds?.resourceName;
            if (resourceName === undefined)
                return undefined;
            const config = yield* getByIdentity(syncType, resourceName);
            return config === undefined ? undefined : toAttrs(config);
        }),
        reconcile: Effect.fn(function* ({ news, session }) {
            const syncType = news.syncType ?? DEFAULT_SYNC_TYPE;
            // 1. Observe — cloud state is authoritative.
            let observed = yield* getByIdentity(syncType, news.resourceName);
            // 2. Ensure — create if missing; tolerate the AlreadyExists race.
            if (observed === undefined) {
                observed = yield* codeconnections
                    .createSyncConfiguration({
                    Branch: news.branch,
                    ConfigFile: news.configFile,
                    RepositoryLinkId: news.repositoryLinkId,
                    ResourceName: news.resourceName,
                    RoleArn: news.roleArn,
                    SyncType: syncType,
                    PublishDeploymentStatus: news.publishDeploymentStatus,
                    TriggerResourceUpdateOn: news.triggerResourceUpdateOn,
                    PullRequestComment: news.pullRequestComment,
                })
                    .pipe(Effect.map((res) => res.SyncConfiguration), Effect.catchTag("ResourceAlreadyExistsException", (error) => getByIdentity(syncType, news.resourceName).pipe(Effect.flatMap((config) => config === undefined
                    ? Effect.fail(error)
                    : Effect.succeed(config)))));
            }
            // 3. Sync — diff every mutable field against OBSERVED cloud state;
            // skip the API entirely on no-op. Optional prop left undefined
            // keeps the observed value (service-side default).
            const drifted = observed.Branch !== news.branch ||
                (observed.ConfigFile ?? "") !== news.configFile ||
                observed.RepositoryLinkId !== news.repositoryLinkId ||
                observed.RoleArn !== news.roleArn ||
                (news.publishDeploymentStatus !== undefined &&
                    observed.PublishDeploymentStatus !==
                        news.publishDeploymentStatus) ||
                (news.triggerResourceUpdateOn !== undefined &&
                    observed.TriggerResourceUpdateOn !==
                        news.triggerResourceUpdateOn) ||
                (news.pullRequestComment !== undefined &&
                    observed.PullRequestComment !== news.pullRequestComment);
            if (drifted) {
                const updated = yield* codeconnections.updateSyncConfiguration({
                    ResourceName: news.resourceName,
                    SyncType: syncType,
                    Branch: news.branch,
                    ConfigFile: news.configFile,
                    RepositoryLinkId: news.repositoryLinkId,
                    RoleArn: news.roleArn,
                    PublishDeploymentStatus: news.publishDeploymentStatus,
                    TriggerResourceUpdateOn: news.triggerResourceUpdateOn,
                    PullRequestComment: news.pullRequestComment,
                });
                observed = updated.SyncConfiguration;
            }
            yield* session.note(`${syncType}/${news.resourceName}`);
            return toAttrs(observed);
        }),
        // DeleteSyncConfiguration documents no NotFound error — observe
        // first so a repeat delete (after a state-persistence failure) is a
        // no-op instead of an InvalidInput failure.
        delete: Effect.fn(function* ({ output }) {
            const observed = yield* getByIdentity(output.syncType, output.resourceName);
            if (observed !== undefined) {
                yield* codeconnections.deleteSyncConfiguration({
                    SyncType: output.syncType,
                    ResourceName: output.resourceName,
                });
            }
        }),
        // Enumerate every repository link's sync configurations.
        list: () => codeconnections.listRepositoryLinks.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.RepositoryLinks ?? [])), Effect.flatMap((links) => Effect.forEach(links, (link) => codeconnections.listSyncConfigurations
            .pages({
            RepositoryLinkId: link.RepositoryLinkId,
            SyncType: DEFAULT_SYNC_TYPE,
        })
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.SyncConfigurations ?? []))), { concurrency: 4 })), Effect.map((configs) => configs.flat().map((config) => ({
            resourceName: config.ResourceName,
            syncType: config.SyncType,
            branch: config.Branch,
            configFile: config.ConfigFile ?? "",
            repositoryLinkId: config.RepositoryLinkId,
            repositoryName: config.RepositoryName,
            ownerId: config.OwnerId,
            providerType: config.ProviderType ?? "",
            roleArn: config.RoleArn,
        })))),
    };
}));
//# sourceMappingURL=SyncConfiguration.js.map