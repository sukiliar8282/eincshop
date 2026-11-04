import * as grafana from "@distilled.cloud/aws/grafana";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
import { syncGrafanaTags, toTagRecord, unredact } from "./internal.js";
/**
 * An Amazon Managed Grafana workspace — a fully-managed Grafana server for
 * visualizing operational metrics, logs, and traces.
 *
 * Grafana workspaces require IAM Identity Center (AWS SSO) to be enabled in
 * the account when `authenticationProviders` includes `AWS_SSO`. Workspace
 * provisioning is asynchronous and can take a few minutes.
 *
 * ### Creating a Workspace
 * **Example:** SSO-Authenticated Workspace
 * ```typescript
 * const workspace = yield* Grafana.Workspace("Dashboards", {
 *   accountAccessType: "CURRENT_ACCOUNT",
 *   authenticationProviders: ["AWS_SSO"],
 *   permissionType: "SERVICE_MANAGED",
 *   dataSources: ["PROMETHEUS", "CLOUDWATCH"],
 * });
 * ```
 *
 * @resource
 */
export const Workspace = Resource("AWS.Grafana.Workspace");
export const WorkspaceProvider = () => Provider.effect(Workspace, Effect.gen(function* () {
    const arnFor = (accountId, region, id) => `arn:aws:grafana:${region}:${accountId}:/workspaces/${id}`;
    const toAttrs = (accountId, region, ws) => ({
        workspaceId: ws.id,
        workspaceArn: arnFor(accountId, region, ws.id),
        endpoint: ws.endpoint,
        grafanaVersion: ws.grafanaVersion,
        status: ws.status,
    });
    /** Describe a workspace by id; typed not-found → undefined. */
    const describe = Effect.fn(function* (id) {
        const response = yield* grafana
            .describeWorkspace({ workspaceId: id })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        return response?.workspace;
    });
    /** Poll until the workspace reaches ACTIVE; fail fast on *FAILED*. */
    const waitActive = Effect.fn(function* (id) {
        const ws = yield* grafana.describeWorkspace({ workspaceId: id }).pipe(Effect.map((r) => r.workspace), Effect.repeat({
            schedule: Schedule.max([
                Schedule.fixed("5 seconds"),
                Schedule.recurs(36),
            ]),
            until: (w) => w.status === "ACTIVE" || w.status.endsWith("FAILED"),
        }));
        if (ws.status !== "ACTIVE") {
            return yield* Effect.fail(new Error(`Grafana workspace ${id} did not become ACTIVE (status: ${ws.status})`));
        }
        return ws;
    });
    return {
        stables: ["workspaceId", "workspaceArn", "endpoint"],
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return undefined;
            const authChanged = JSON.stringify([...(olds?.authenticationProviders ?? [])].sort()) !== JSON.stringify([...news.authenticationProviders].sort());
            if (authChanged ||
                (olds?.accountAccessType ?? "CURRENT_ACCOUNT") !==
                    (news.accountAccessType ?? "CURRENT_ACCOUNT") ||
                (olds?.permissionType ?? "SERVICE_MANAGED") !==
                    (news.permissionType ?? "SERVICE_MANAGED")) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, output }) {
            if (!output?.workspaceId)
                return undefined;
            const { accountId, region } = yield* AWSEnvironment.current;
            const ws = yield* describe(output.workspaceId);
            if (ws === undefined)
                return undefined;
            const attrs = toAttrs(accountId, region, ws);
            const tags = toTagRecord(ws.tags);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const { accountId, region } = yield* AWSEnvironment.current;
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // 1. Observe — cloud state is authoritative; output is an id cache.
            let ws = output?.workspaceId !== undefined
                ? yield* describe(output.workspaceId)
                : undefined;
            // 2. Ensure — create if missing, then wait for ACTIVE.
            if (ws === undefined) {
                const created = yield* grafana.createWorkspace({
                    accountAccessType: news.accountAccessType ?? "CURRENT_ACCOUNT",
                    permissionType: news.permissionType ?? "SERVICE_MANAGED",
                    authenticationProviders: news.authenticationProviders,
                    workspaceName: news.name,
                    workspaceDescription: news.description,
                    workspaceRoleArn: news.workspaceRoleArn,
                    workspaceDataSources: news.dataSources,
                    grafanaVersion: news.grafanaVersion,
                    tags: desiredTags,
                });
                ws = yield* waitActive(created.workspace.id);
            }
            else {
                // 3. Sync mutable settings via updateWorkspace when drifted.
                const drifted = (news.name ?? undefined) !== unredact(ws.name) ||
                    (news.description ?? undefined) !== unredact(ws.description) ||
                    JSON.stringify([...(news.dataSources ?? [])].sort()) !==
                        JSON.stringify([...(ws.dataSources ?? [])].sort());
                if (drifted) {
                    yield* grafana.updateWorkspace({
                        workspaceId: ws.id,
                        workspaceName: news.name,
                        workspaceDescription: news.description,
                        workspaceDataSources: news.dataSources,
                        workspaceRoleArn: news.workspaceRoleArn,
                    });
                    ws = yield* waitActive(ws.id);
                }
            }
            // 3b. Sync tags — diff against OBSERVED cloud tags.
            const arn = arnFor(accountId, region, ws.id);
            yield* syncGrafanaTags(arn, desiredTags);
            yield* session.note(ws.id);
            return toAttrs(accountId, region, ws);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* grafana
                .deleteWorkspace({ workspaceId: output.workspaceId })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void), Effect.retry({
                while: (e) => e._tag === "ConflictException",
                schedule: Schedule.max([
                    Schedule.fixed("5 seconds"),
                    Schedule.recurs(24),
                ]),
            }));
        }),
        list: () => grafana.listWorkspaces.pages({}).pipe(Stream.runCollect, Effect.flatMap((chunk) => Effect.gen(function* () {
            const { accountId, region } = yield* AWSEnvironment.current;
            return Array.from(chunk).flatMap((page) => page.workspaces.map((summary) => ({
                workspaceId: summary.id,
                workspaceArn: arnFor(accountId, region, summary.id),
                endpoint: summary.endpoint,
                grafanaVersion: summary.grafanaVersion,
                status: summary.status,
            })));
        }))),
    };
}));
//# sourceMappingURL=Workspace.js.map