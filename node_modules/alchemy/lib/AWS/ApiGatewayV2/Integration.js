import * as agw2 from "@distilled.cloud/aws/apigatewayv2";
import * as Effect from "effect/Effect";
import { deepEqual, isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { toWireMillis } from "../../Util/Duration.js";
import { collectAllPages, retryOnTooManyRequests } from "./common.js";
/**
 * An API Gateway v2 Integration — the backend target a Route forwards to.
 *
 * For HTTP APIs the common integration is `AWS_PROXY` with payload format
 * `2.0`, pointing directly at a Lambda function ARN. For WebSocket APIs the
 * `integrationUri` must be the full Lambda invocation URI.
 * ### Lambda proxy integration (HTTP API)
 * **Example:** AWS_PROXY integration with payload 2.0
 * ```typescript
 * const integration = yield* ApiGatewayV2.Integration("Fn", {
 *   api,
 *   integrationType: "AWS_PROXY",
 *   integrationUri: fn.functionArn,
 *   payloadFormatVersion: "2.0",
 * });
 * ```
 *
 * ### HTTP proxy integration
 * **Example:** Forward to an external HTTP endpoint
 * ```typescript
 * const integration = yield* ApiGatewayV2.Integration("Upstream", {
 *   api,
 *   integrationType: "HTTP_PROXY",
 *   integrationUri: "https://example.com/{proxy}",
 *   integrationMethod: "ANY",
 *   payloadFormatVersion: "1.0",
 * });
 * ```
 *
 * @resource
 */
export const IntegrationResource = Resource("AWS.ApiGatewayV2.Integration");
/**
 * User-facing wrapper for the Integration resource. Accepts `api: Api` as
 * the idiomatic way to attach an integration to an API.
 */
export const Integration = (id, props) => Effect.gen(function* () {
    const { api, ...rest } = props;
    const apiId = rest.apiId ?? api?.apiId;
    if (!apiId) {
        return yield* Effect.die("Integration requires either `api` (preferred) or an explicit `apiId`.");
    }
    return yield* IntegrationResource(id, { ...rest, apiId });
});
const snapshotFromIntegration = (apiId, integ) => ({
    apiId,
    integrationId: integ.IntegrationId,
    integrationType: integ.IntegrationType ?? "AWS_PROXY",
    integrationUri: integ.IntegrationUri,
    integrationMethod: integ.IntegrationMethod,
    payloadFormatVersion: integ.PayloadFormatVersion,
    connectionType: integ.ConnectionType,
    connectionId: integ.ConnectionId,
    credentialsArn: integ.CredentialsArn,
    description: integ.Description,
    integrationSubtype: integ.IntegrationSubtype,
    passthroughBehavior: integ.PassthroughBehavior,
    requestParameters: integ.RequestParameters,
    requestTemplates: integ.RequestTemplates,
    responseParameters: integ.ResponseParameters,
    templateSelectionExpression: integ.TemplateSelectionExpression,
    timeoutInMillis: integ.TimeoutInMillis,
    contentHandlingStrategy: integ.ContentHandlingStrategy,
});
const desiredRequest = (news) => ({
    IntegrationType: news.integrationType,
    IntegrationUri: news.integrationUri,
    IntegrationMethod: news.integrationMethod,
    PayloadFormatVersion: news.payloadFormatVersion,
    ConnectionType: news.connectionType,
    ConnectionId: news.connectionId,
    CredentialsArn: news.credentialsArn,
    Description: news.description,
    IntegrationSubtype: news.integrationSubtype,
    PassthroughBehavior: news.passthroughBehavior,
    RequestParameters: news.requestParameters,
    RequestTemplates: news.requestTemplates,
    ResponseParameters: news.responseParameters,
    TemplateSelectionExpression: news.templateSelectionExpression,
    TimeoutInMillis: toWireMillis(news.timeout),
    TlsConfig: news.tlsConfig,
    ContentHandlingStrategy: news.contentHandlingStrategy,
});
export const IntegrationProvider = () => Provider.effect(IntegrationResource, Effect.gen(function* () {
    const getIntegrationSafe = (apiId, integrationId) => agw2
        .getIntegration({ ApiId: apiId, IntegrationId: integrationId })
        .pipe(Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
    return IntegrationResource.Provider.of({
        stables: ["apiId", "integrationId"],
        list: () => Effect.gen(function* () {
            const apis = yield* collectAllPages((NextToken) => agw2.getApis({ NextToken }));
            const perApi = yield* Effect.forEach(apis.filter((api) => api.ApiId != null), (api) => collectAllPages((NextToken) => agw2.getIntegrations({ ApiId: api.ApiId, NextToken })).pipe(Effect.map((items) => items
                .filter((integ) => integ.IntegrationId != null)
                .map((integ) => snapshotFromIntegration(api.ApiId, integ))), 
            // API deleted between list and getIntegrations — skip it.
            Effect.catchTag("NotFoundException", () => Effect.succeed([]))), { concurrency: 5 });
            return perApi.flat();
        }),
        read: Effect.fn(function* ({ output }) {
            if (!output?.apiId || !output.integrationId)
                return undefined;
            const integ = yield* getIntegrationSafe(output.apiId, output.integrationId);
            if (!integ?.IntegrationId)
                return undefined;
            return snapshotFromIntegration(output.apiId, integ);
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            if (news.apiId !== olds.apiId) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ news, output, session }) {
            const apiId = output?.apiId ?? news.apiId;
            // 1. OBSERVE
            let observed = output?.integrationId
                ? yield* getIntegrationSafe(apiId, output.integrationId)
                : undefined;
            // 2. ENSURE
            if (!observed?.IntegrationId) {
                observed = yield* retryOnTooManyRequests(agw2.createIntegration({ ApiId: apiId, ...desiredRequest(news) }));
                yield* session.note(`Created integration ${observed.IntegrationId}`);
                return snapshotFromIntegration(apiId, observed);
            }
            // 3. SYNC — compare the observed snapshot against desired and
            //    update only on drift.
            const snapshot = snapshotFromIntegration(apiId, observed);
            const desired = desiredRequest(news);
            const drift = snapshot.integrationType !== desired.IntegrationType ||
                snapshot.integrationUri !== desired.IntegrationUri ||
                snapshot.integrationMethod !== desired.IntegrationMethod ||
                (desired.PayloadFormatVersion !== undefined &&
                    snapshot.payloadFormatVersion !== desired.PayloadFormatVersion) ||
                (desired.ConnectionType !== undefined &&
                    snapshot.connectionType !== desired.ConnectionType) ||
                snapshot.connectionId !== desired.ConnectionId ||
                snapshot.credentialsArn !== desired.CredentialsArn ||
                snapshot.description !== desired.Description ||
                snapshot.integrationSubtype !== desired.IntegrationSubtype ||
                (desired.PassthroughBehavior !== undefined &&
                    snapshot.passthroughBehavior !== desired.PassthroughBehavior) ||
                (desired.RequestParameters !== undefined &&
                    !deepEqual(snapshot.requestParameters, desired.RequestParameters)) ||
                (desired.RequestTemplates !== undefined &&
                    !deepEqual(snapshot.requestTemplates, desired.RequestTemplates)) ||
                (desired.ResponseParameters !== undefined &&
                    !deepEqual(snapshot.responseParameters, desired.ResponseParameters)) ||
                snapshot.templateSelectionExpression !==
                    desired.TemplateSelectionExpression ||
                (desired.TimeoutInMillis !== undefined &&
                    snapshot.timeoutInMillis !== desired.TimeoutInMillis) ||
                (desired.ContentHandlingStrategy !== undefined &&
                    snapshot.contentHandlingStrategy !==
                        desired.ContentHandlingStrategy);
            if (drift) {
                const updated = yield* retryOnTooManyRequests(agw2.updateIntegration({
                    ApiId: apiId,
                    IntegrationId: snapshot.integrationId,
                    ...desired,
                }));
                yield* session.note(`Updated integration ${snapshot.integrationId}`);
                return snapshotFromIntegration(apiId, updated);
            }
            return snapshot;
        }),
        delete: Effect.fn(function* ({ output, session }) {
            yield* retryOnTooManyRequests(agw2
                .deleteIntegration({
                ApiId: output.apiId,
                IntegrationId: output.integrationId,
            })
                .pipe(Effect.catchTag("NotFoundException", () => Effect.void)));
            yield* session.note(`Deleted integration ${output.integrationId}`);
        }),
    });
}));
//# sourceMappingURL=Integration.js.map