import * as control from "@distilled.cloud/aws/bedrock-agentcore-control";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { AgentCoreProvisioningFailed, createGatewayName, readAgentCoreTags, retryWhileConflict, retryWhileValidation, syncAgentCoreTags, unredact, } from "./internal.js";
/**
 * An Amazon Bedrock AgentCore Gateway — a managed MCP endpoint that turns
 * APIs and Lambda functions into agent-callable tools.
 *
 * A gateway fronts one or more targets (OpenAPI specs, Smithy models, Lambda
 * functions) behind a single MCP URL with centralized authorization (SigV4 or
 * JWT).
 *
 * ### Creating Gateways
 * **Example:** IAM-Authorized MCP Gateway
 * ```typescript
 * import * as AgentCore from "alchemy/AWS/BedrockAgentCore";
 * import * as IAM from "alchemy/AWS/IAM";
 *
 * const role = yield* IAM.Role("GatewayRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { Service: "bedrock-agentcore.amazonaws.com" },
 *         Action: ["sts:AssumeRole"],
 *       },
 *     ],
 *   },
 * });
 *
 * const gateway = yield* AgentCore.Gateway("ToolGateway", {
 *   roleArn: role.roleArn,
 *   authorizerType: "AWS_IAM",
 * });
 * ```
 *
 * **Example:** JWT-Authorized Gateway
 * ```typescript
 * const gateway = yield* AgentCore.Gateway("JwtGateway", {
 *   roleArn: role.roleArn,
 *   authorizerType: "CUSTOM_JWT",
 *   authorizerConfiguration: {
 *     customJWTAuthorizer: {
 *       discoveryUrl: `https://cognito-idp.us-west-2.amazonaws.com/${userPool.userPoolId}/.well-known/openid-configuration`,
 *       allowedClients: [client.clientId],
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export const Gateway = Resource("AWS.BedrockAgentCore.Gateway");
/** Statuses indicating an in-flight transition to wait out. */
const GATEWAY_TRANSIENT = new Set(["CREATING", "UPDATING", "DELETING"]);
export const GatewayProvider = () => Provider.effect(Gateway, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return props.name ?? (yield* createGatewayName(id));
    });
    const getGatewayOrUndefined = Effect.fn(function* (gatewayIdentifier) {
        return yield* control
            .getGateway({ gatewayIdentifier })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    const findByName = Effect.fn(function* (name) {
        const pages = yield* control.listGateways
            .pages({})
            .pipe(Stream.runCollect);
        const summary = Array.from(pages)
            .flatMap((page) => page.items ?? [])
            .find((s) => s.name === name);
        return summary === undefined
            ? undefined
            : yield* getGatewayOrUndefined(summary.gatewayId);
    });
    const waitForSettled = Effect.fn(function* (gatewayId) {
        return yield* getGatewayOrUndefined(gatewayId).pipe(Effect.repeat({
            schedule: Schedule.fixed("5 seconds"),
            until: (g) => g === undefined || !GATEWAY_TRANSIENT.has(g.status),
            times: 36,
        }));
    });
    const toAttributes = (gateway) => ({
        gatewayId: gateway.gatewayId,
        gatewayArn: gateway.gatewayArn,
        gatewayUrl: gateway.gatewayUrl,
        name: gateway.name,
        status: gateway.status,
    });
    return Gateway.Provider.of({
        stables: ["gatewayId", "gatewayArn", "name"],
        list: () => Effect.gen(function* () {
            const pages = yield* control.listGateways
                .pages({})
                .pipe(Stream.runCollect);
            const summaries = Array.from(pages).flatMap((page) => page.items ?? []);
            const hydrated = yield* Effect.forEach(summaries, (s) => getGatewayOrUndefined(s.gatewayId), { concurrency: 5 });
            return hydrated.filter((g) => g !== undefined).map(toAttributes);
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const gateway = output?.gatewayId
                ? yield* getGatewayOrUndefined(output.gatewayId)
                : yield* findByName(yield* createName(id, olds ?? {}));
            if (gateway === undefined || gateway.status === "DELETING") {
                return undefined;
            }
            const attrs = toAttributes(gateway);
            const tags = yield* readAgentCoreTags(gateway.gatewayArn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds ?? {});
            const newName = yield* createName(id, news ?? {});
            if (oldName !== newName) {
                return { action: "replace" };
            }
            if ((olds?.kmsKeyArn ?? undefined) !== (news?.kmsKeyArn ?? undefined)) {
                return { action: "replace" };
            }
            // description, role, authorizer, protocol config, and tags converge
            // via update.
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const props = news ?? {};
            const name = output?.name ?? (yield* createName(id, props));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...props.tags, ...internalTags };
            const protocolType = props.protocolType ?? "MCP";
            const authorizerType = props.authorizerType ?? "AWS_IAM";
            // 1. OBSERVE
            let gateway = output?.gatewayId
                ? yield* getGatewayOrUndefined(output.gatewayId)
                : undefined;
            if (gateway === undefined) {
                gateway = yield* findByName(name);
            }
            // 2. ENSURE — a freshly created IAM role is not instantly assumable
            // by the AgentCore service principal, so ride out the transient
            // ValidationException; tolerate the name-exists conflict race.
            if (gateway === undefined) {
                const created = yield* control
                    .createGateway({
                    name,
                    description: props.description,
                    roleArn: props.roleArn,
                    protocolType,
                    protocolConfiguration: props.protocolConfiguration,
                    authorizerType,
                    authorizerConfiguration: props.authorizerConfiguration,
                    kmsKeyArn: props.kmsKeyArn,
                    exceptionLevel: props.exceptionLevel,
                    tags: desiredTags,
                })
                    .pipe(retryWhileValidation, Effect.catchTag("ConflictException", () => findByName(name)));
                gateway =
                    created === undefined
                        ? yield* findByName(name)
                        : yield* getGatewayOrUndefined(created.gatewayId);
            }
            if (gateway === undefined) {
                return yield* new AgentCoreProvisioningFailed({
                    message: `gateway '${name}' was neither created nor found`,
                });
            }
            gateway = (yield* waitForSettled(gateway.gatewayId)) ?? gateway;
            if (gateway.status === "FAILED") {
                return yield* new AgentCoreProvisioningFailed({
                    message: `gateway '${name}' failed: ${(gateway.statusReasons ?? []).join("; ")}`,
                });
            }
            // 3. SYNC — converge mutable settings from OBSERVED state.
            const drifted = (unredact(gateway.description) ?? undefined) !==
                (props.description ?? unredact(gateway.description)) ||
                gateway.roleArn !== props.roleArn ||
                gateway.authorizerType !== authorizerType ||
                (gateway.protocolType ?? "MCP") !== protocolType ||
                (gateway.exceptionLevel ?? undefined) !==
                    (props.exceptionLevel ?? undefined) ||
                JSON.stringify(gateway.authorizerConfiguration ?? null) !==
                    JSON.stringify(props.authorizerConfiguration ??
                        gateway.authorizerConfiguration ??
                        null) ||
                (props.protocolConfiguration !== undefined &&
                    JSON.stringify(gateway.protocolConfiguration ?? null) !==
                        JSON.stringify(props.protocolConfiguration));
            if (drifted) {
                yield* control
                    .updateGateway({
                    gatewayIdentifier: gateway.gatewayId,
                    name,
                    description: props.description,
                    roleArn: props.roleArn,
                    protocolType,
                    protocolConfiguration: props.protocolConfiguration,
                    authorizerType,
                    authorizerConfiguration: props.authorizerConfiguration,
                    kmsKeyArn: props.kmsKeyArn,
                    exceptionLevel: props.exceptionLevel,
                })
                    .pipe(retryWhileConflict);
                gateway = (yield* waitForSettled(gateway.gatewayId)) ?? gateway;
            }
            // 3b. SYNC TAGS against observed cloud tags.
            yield* syncAgentCoreTags(gateway.gatewayArn, desiredTags);
            // 4. RETURN fresh attributes.
            yield* session.note(gateway.gatewayId);
            return toAttributes(gateway);
        }),
        // A gateway with live targets rejects deletion with a
        // ConflictException until they are gone — the engine deletes targets
        // first, but their teardown is eventually consistent.
        delete: Effect.fn(function* ({ output }) {
            yield* control
                .deleteGateway({ gatewayIdentifier: output.gatewayId })
                .pipe(retryWhileConflict, Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            yield* control
                .getGateway({ gatewayIdentifier: output.gatewayId })
                .pipe(Effect.map((g) => g.status), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed("GONE")), Effect.repeat({
                schedule: Schedule.fixed("5 seconds"),
                until: (status) => status === "GONE",
                times: 24,
            }));
        }),
    });
}));
//# sourceMappingURL=Gateway.js.map