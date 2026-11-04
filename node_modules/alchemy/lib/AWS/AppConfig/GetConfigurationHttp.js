import * as appconfigdata from "@distilled.cloud/aws/appconfigdata";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Ref from "effect/Ref";
import * as Stream from "effect/Stream";
import * as Binding from "../../Binding.js";
import * as Output from "../../Output.js";
import { toWireSeconds } from "../../Util/Duration.js";
import { AWSEnvironment } from "../Environment.js";
import { isBindingHost } from "../Lambda/Function.js";
import { GetConfiguration, } from "./GetConfiguration.js";
/**
 * HTTP implementation of the {@link GetConfiguration} binding. Calls the
 * AppConfig data plane (`StartConfigurationSession` +
 * `GetLatestConfiguration`) with the Lambda's IAM role, caching the poll
 * token and last-seen content across calls.
 *
 * Provide it on the hosting Lambda function's Effect so the binding is
 * available at runtime:
 *
 * @example
 * ```typescript
 * export default MyFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     const getConfig = yield* AppConfig.GetConfiguration(app, env, profile);
 *     return {
 *       fetch: Effect.gen(function* () {
 *         const { content } = yield* getConfig().pipe(Effect.orDie);
 *         return HttpServerResponse.text(content ?? "");
 *       }),
 *     };
 *   }).pipe(Effect.provide(AppConfig.GetConfigurationHttp)),
 * );
 * ```
 */
export const GetConfigurationHttp = Layer.effect(GetConfiguration, Effect.gen(function* () {
    const startSession = yield* appconfigdata.startConfigurationSession;
    const getLatest = yield* appconfigdata.getLatestConfiguration;
    return Effect.fn(function* (application, environment, configurationProfile, options) {
        // Outputs yield DEFERRED effects — resolve again per invocation below.
        const ApplicationId = yield* application.applicationId;
        const EnvironmentId = yield* environment.environmentId;
        const ConfigurationProfileId = yield* configurationProfile.configurationProfileId;
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                const { accountId, region } = yield* AWSEnvironment.current;
                yield* host.bind `Allow(${host}, AWS.AppConfig.GetConfiguration(${application}, ${environment}, ${configurationProfile}))`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            Action: [
                                "appconfig:StartConfigurationSession",
                                "appconfig:GetLatestConfiguration",
                            ],
                            Resource: [
                                Output.interpolate `arn:aws:appconfig:${region}:${accountId}:application/${application.applicationId}/environment/${environment.environmentId}/configuration/${configurationProfile.configurationProfileId}`,
                            ],
                        },
                    ],
                });
            }
        }
        const cache = yield* Ref.make({
            token: undefined,
            lastContent: undefined,
            lastContentType: undefined,
            lastVersionLabel: undefined,
        });
        return Effect.fn(`AWS.AppConfig.GetConfiguration(${application.LogicalId}, ${environment.LogicalId}, ${configurationProfile.LogicalId})`)(function* () {
            const applicationId = yield* ApplicationId;
            const environmentId = yield* EnvironmentId;
            const configurationProfileId = yield* ConfigurationProfileId;
            let state = yield* Ref.get(cache);
            if (state.token === undefined) {
                const session = yield* startSession({
                    ApplicationIdentifier: applicationId,
                    EnvironmentIdentifier: environmentId,
                    ConfigurationProfileIdentifier: configurationProfileId,
                    RequiredMinimumPollIntervalInSeconds: toWireSeconds(options?.requiredMinimumPollInterval),
                });
                state = { ...state, token: session.InitialConfigurationToken };
            }
            const response = yield* getLatest({
                ConfigurationToken: state.token,
            });
            // Each token is single-use; the response hands back the next one.
            const nextToken = response.NextPollConfigurationToken ?? state.token;
            // Decoding the (already-buffered) config body only fails on a
            // corrupt payload — a defect, not part of the operation's typed union.
            const fetched = response.Configuration
                ? yield* Stream.mkString(Stream.decodeText(response.Configuration)).pipe(Effect.orDie)
                : "";
            // An empty body means "unchanged" — keep the last-seen content.
            const content = fetched.length > 0 ? fetched : state.lastContent;
            const contentType = response.ContentType ?? state.lastContentType;
            const versionLabel = response.VersionLabel ?? state.lastVersionLabel;
            yield* Ref.set(cache, {
                token: nextToken,
                lastContent: content,
                lastContentType: contentType,
                lastVersionLabel: versionLabel,
            });
            return { content, contentType, versionLabel };
        });
    });
}));
//# sourceMappingURL=GetConfigurationHttp.js.map