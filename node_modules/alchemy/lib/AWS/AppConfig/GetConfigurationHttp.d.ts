import * as Layer from "effect/Layer";
import { GetConfiguration } from "./GetConfiguration.ts";
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
export declare const GetConfigurationHttp: Layer.Layer<GetConfiguration, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=GetConfigurationHttp.d.ts.map