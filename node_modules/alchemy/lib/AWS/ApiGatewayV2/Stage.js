import * as agw2 from "@distilled.cloud/aws/apigatewayv2";
import * as Effect from "effect/Effect";
import { deepEqual, isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
import { collectAllPages, retryOnTooManyRequests, stageArn, syncTags, tagRecord, } from "./common.js";
/**
 * An API Gateway v2 Stage — the deployed, callable endpoint of an HTTP or
 * WebSocket API.
 * ### The $default auto-deploy stage
 * The canonical modern setup is a single `$default` stage with
 * `autoDeploy: true` — every route/integration change goes live
 * automatically at the API root endpoint, with no `Deployment` juggling.
 *
 * **Example:** $default stage with auto-deploy
 * ```typescript
 * const stage = yield* ApiGatewayV2.Stage("Stage", {
 *   api,
 *   autoDeploy: true,
 * });
 * // stage.invokeUrl === api.apiEndpoint
 * ```
 *
 * ### Named stages
 * **Example:** A named dev stage
 * ```typescript
 * const dev = yield* ApiGatewayV2.Stage("Dev", {
 *   api,
 *   stageName: "dev",
 *   autoDeploy: true,
 *   stageVariables: { logLevel: "debug" },
 * });
 * ```
 *
 * ### Throttling
 * **Example:** Default route throttling
 * ```typescript
 * const stage = yield* ApiGatewayV2.Stage("Stage", {
 *   api,
 *   autoDeploy: true,
 *   defaultRouteSettings: {
 *     ThrottlingBurstLimit: 100,
 *     ThrottlingRateLimit: 50,
 *   },
 * });
 * ```
 *
 * @resource
 */
export const StageResource = Resource("AWS.ApiGatewayV2.Stage");
/**
 * User-facing wrapper for the Stage resource. Accepts `api: Api` as the
 * idiomatic way to attach a stage to an API.
 */
export const Stage = (id, props = {}) => Effect.gen(function* () {
    const { api, ...rest } = props;
    const apiId = rest.apiId ?? api?.apiId;
    if (!apiId) {
        return yield* Effect.die("Stage requires either `api` (preferred) or an explicit `apiId`.");
    }
    return yield* StageResource(id, { ...rest, apiId });
});
const computeUrls = (input) => {
    const { region, accountId, apiId, stageName, protocolType, apiEndpoint } = input;
    const host = `${apiId}.execute-api.${region}.amazonaws.com`;
    const callbackUrl = `https://${host}/${stageName}`;
    const invokeUrl = protocolType === "WEBSOCKET"
        ? `wss://${host}/${stageName}`
        : stageName === "$default"
            ? (apiEndpoint ?? `https://${host}`)
            : `${apiEndpoint ?? `https://${host}`}/${stageName}`;
    const connectionsArn = `arn:aws:execute-api:${region}:${accountId}:${apiId}/${stageName}/*/@connections/*`;
    return { invokeUrl, callbackUrl, connectionsArn };
};
const snapshotFromStage = (apiId, stage, urls) => ({
    apiId,
    stageName: stage.StageName ?? "",
    invokeUrl: urls.invokeUrl,
    callbackUrl: urls.callbackUrl,
    connectionsArn: urls.connectionsArn,
    autoDeploy: stage.AutoDeploy,
    deploymentId: stage.DeploymentId,
    description: stage.Description,
    stageVariables: stage.StageVariables,
    defaultRouteSettings: stage.DefaultRouteSettings,
    routeSettings: stage.RouteSettings,
    accessLogSettings: stage.AccessLogSettings,
    clientCertificateId: stage.ClientCertificateId,
    tags: tagRecord(stage.Tags),
});
export const StageProvider = () => Provider.effect(StageResource, Effect.gen(function* () {
    const getStageSafe = (apiId, stageName) => agw2
        .getStage({ ApiId: apiId, StageName: stageName })
        .pipe(Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
    const getApiInfo = (apiId) => agw2.getApi({ ApiId: apiId }).pipe(Effect.map((api) => ({
        protocolType: api.ProtocolType,
        apiEndpoint: api.ApiEndpoint,
    })), Effect.catchTag("NotFoundException", () => Effect.succeed({
        protocolType: undefined,
        apiEndpoint: undefined,
    })));
    return StageResource.Provider.of({
        stables: [
            "apiId",
            "stageName",
            "invokeUrl",
            "callbackUrl",
            "connectionsArn",
        ],
        list: () => Effect.gen(function* () {
            const { region, accountId } = yield* AWSEnvironment.current;
            const apis = yield* collectAllPages((NextToken) => agw2.getApis({ NextToken }));
            const perApi = yield* Effect.forEach(apis.filter((api) => api.ApiId != null), (api) => collectAllPages((NextToken) => agw2.getStages({ ApiId: api.ApiId, NextToken })).pipe(Effect.map((stages) => stages
                .filter((stage) => stage.StageName != null)
                .map((stage) => snapshotFromStage(api.ApiId, stage, computeUrls({
                region,
                accountId,
                apiId: api.ApiId,
                stageName: stage.StageName,
                protocolType: api.ProtocolType,
                apiEndpoint: api.ApiEndpoint,
            })))), Effect.catchTag("NotFoundException", () => Effect.succeed([]))), { concurrency: 5 });
            return perApi.flat();
        }),
        read: Effect.fn(function* ({ output }) {
            if (!output?.apiId || !output.stageName)
                return undefined;
            const { region, accountId } = yield* AWSEnvironment.current;
            const stage = yield* getStageSafe(output.apiId, output.stageName);
            if (!stage?.StageName)
                return undefined;
            const info = yield* getApiInfo(output.apiId);
            return snapshotFromStage(output.apiId, stage, computeUrls({
                region,
                accountId,
                apiId: output.apiId,
                stageName: output.stageName,
                ...info,
            }));
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            if (news.apiId !== olds.apiId ||
                (news.stageName ?? "$default") !== (olds.stageName ?? "$default")) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const { region, accountId } = yield* AWSEnvironment.current;
            const apiId = output?.apiId ?? news.apiId;
            const stageName = output?.stageName ?? news.stageName ?? "$default";
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // 1. OBSERVE
            let observed = yield* getStageSafe(apiId, stageName);
            // 2. ENSURE — tolerate a ConflictException as a concurrent-create
            //    race and fall through to observation.
            if (!observed?.StageName) {
                observed = yield* retryOnTooManyRequests(agw2.createStage({
                    ApiId: apiId,
                    StageName: stageName,
                    AutoDeploy: news.autoDeploy,
                    DeploymentId: news.deploymentId,
                    Description: news.description,
                    StageVariables: news.stageVariables,
                    DefaultRouteSettings: news.defaultRouteSettings,
                    RouteSettings: news.routeSettings,
                    AccessLogSettings: news.accessLogSettings,
                    ClientCertificateId: news.clientCertificateId,
                    Tags: desiredTags,
                }));
                yield* session.note(`Created stage ${stageName}`);
            }
            const urls = computeUrls({
                region,
                accountId,
                apiId,
                stageName,
                ...(yield* getApiInfo(apiId)),
            });
            const snapshot = snapshotFromStage(apiId, observed, urls);
            // 3. SYNC — update mutable settings on drift.
            const drift = (news.autoDeploy !== undefined &&
                (snapshot.autoDeploy ?? false) !== news.autoDeploy) ||
                (news.deploymentId !== undefined &&
                    snapshot.deploymentId !== news.deploymentId) ||
                snapshot.description !== news.description ||
                (news.stageVariables !== undefined &&
                    !deepEqual(snapshot.stageVariables, news.stageVariables)) ||
                (news.defaultRouteSettings !== undefined &&
                    !deepEqual(snapshot.defaultRouteSettings, news.defaultRouteSettings)) ||
                (news.routeSettings !== undefined &&
                    !deepEqual(snapshot.routeSettings, news.routeSettings)) ||
                (news.accessLogSettings !== undefined &&
                    !deepEqual(snapshot.accessLogSettings, news.accessLogSettings)) ||
                snapshot.clientCertificateId !== news.clientCertificateId;
            if (drift) {
                yield* retryOnTooManyRequests(agw2.updateStage({
                    ApiId: apiId,
                    StageName: stageName,
                    AutoDeploy: news.autoDeploy,
                    DeploymentId: news.deploymentId,
                    Description: news.description,
                    StageVariables: news.stageVariables,
                    DefaultRouteSettings: news.defaultRouteSettings,
                    RouteSettings: news.routeSettings,
                    AccessLogSettings: news.accessLogSettings,
                    ClientCertificateId: news.clientCertificateId,
                }));
                yield* session.note(`Updated stage ${stageName}`);
            }
            // 3b. SYNC TAGS — diff against OBSERVED cloud tags.
            if (!deepEqual(snapshot.tags, desiredTags)) {
                yield* syncTags({
                    resourceArn: stageArn(region, apiId, stageName),
                    oldTags: snapshot.tags,
                    newTags: desiredTags,
                });
            }
            // 4. RETURN fresh state.
            const final = yield* agw2.getStage({
                ApiId: apiId,
                StageName: stageName,
            });
            yield* session.note(`Reconciled stage ${stageName}`);
            return snapshotFromStage(apiId, final, urls);
        }),
        delete: Effect.fn(function* ({ output, session }) {
            yield* retryOnTooManyRequests(agw2
                .deleteStage({
                ApiId: output.apiId,
                StageName: output.stageName,
            })
                .pipe(Effect.catchTag("NotFoundException", () => Effect.void)));
            yield* session.note(`Deleted stage ${output.stageName}`);
        }),
    });
}));
//# sourceMappingURL=Stage.js.map