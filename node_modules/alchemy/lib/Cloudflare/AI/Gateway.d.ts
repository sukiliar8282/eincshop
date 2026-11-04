import * as aiGateway from "@distilled.cloud/cloudflare/ai-gateway";
import * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
export type GatewayRateLimitingTechnique = "fixed" | "sliding";
export type GatewayLogManagementStrategy = "STOP_INSERTING" | "DELETE_OLDEST";
export type GatewayDlp = {
    /**
     * Action to take when a DLP profile matches.
     */
    action: "BLOCK" | "FLAG";
    /**
     * Whether DLP is enabled.
     */
    enabled: boolean;
    /**
     * DLP profile identifiers to apply.
     */
    profiles: string[];
} | {
    /**
     * Whether DLP is enabled.
     */
    enabled: boolean;
    /**
     * DLP policies to apply.
     */
    policies: {
        /**
         * DLP policy identifier.
         */
        id: string;
        /**
         * Action to take when the policy matches.
         */
        action: "FLAG" | "BLOCK";
        /**
         * Request or response phases checked by the policy.
         */
        check: ("REQUEST" | "RESPONSE")[];
        /**
         * Whether the policy is enabled.
         */
        enabled: boolean;
        /**
         * DLP profile identifiers to apply.
         */
        profiles: string[];
    }[];
};
export type GatewayOtel = {
    /**
     * Authorization header value for the OpenTelemetry endpoint.
     */
    authorization?: string;
    /**
     * Additional headers sent to the OpenTelemetry endpoint.
     */
    headers: Record<string, unknown>;
    /**
     * OpenTelemetry endpoint URL.
     */
    url: string;
    /**
     * Payload encoding sent to the OpenTelemetry endpoint.
     * @default "json"
     */
    contentType?: "json" | "protobuf";
};
export type GatewayStripe = {
    /**
     * Authorization header value for Stripe usage events.
     */
    authorization: string;
    /**
     * Stripe usage event payload definitions.
     */
    usageEvents: {
        /**
         * Usage event payload.
         */
        payload: string;
    }[];
};
/**
 * A single spend-limit rule. Caps cumulative spend (in cents) routed through
 * the gateway over a rolling `window` (in seconds), optionally scoped to a set
 * of models or providers.
 */
export type GatewaySpendLimitRule = {
    /**
     * Spend cap for this rule. The amount is in cents (`limitType: "cost"`).
     */
    limit: number;
    /**
     * The kind of limit. Only `"cost"` is currently supported.
     */
    limitType: "cost";
    /**
     * Rolling window over which `limit` accumulates. Accepts an Effect
     * `Duration.Input` — e.g. `"1 minute"`, `"1 day"`, or a `Duration` — and is
     * sent to Cloudflare as whole seconds.
     */
    window: Duration.Input;
    /**
     * Stable identifier for the rule. Cloudflare assigns one if omitted; pass
     * it back to update an existing rule in place.
     */
    id?: string;
    /**
     * Whether this rule is enforced.
     *
     * @default true
     */
    enabled?: boolean;
    /**
     * Arbitrary metadata attached to the rule.
     */
    metadata?: Record<string, unknown>;
    /**
     * Restrict the rule to a set of model ids.
     */
    model?: {
        mode: "filter";
        values: string[];
    };
    /**
     * Restrict the rule to a set of providers.
     */
    provider?: {
        mode: "filter";
        values: string[];
    };
    /**
     * Enforcement algorithm — `fixed` resets on the window boundary, `sliding`
     * tracks a rolling window.
     */
    technique?: GatewayRateLimitingTechnique;
};
/**
 * Per-gateway spend limits — Cloudflare's replacement for the deprecated
 * account-level AI Gateway spending limit. Attach cost caps directly to a
 * gateway via {@link GatewayProps.spendLimits}.
 *
 * @see https://developers.cloudflare.com/ai-gateway/features/spend-limits/
 */
export type GatewaySpendLimits = {
    /**
     * Whether spend limiting is enabled for the gateway.
     */
    enabled?: boolean;
    /**
     * The cost-cap rules applied to requests routed through the gateway.
     */
    rules?: GatewaySpendLimitRule[];
};
export type GatewayProps = {
    /**
     * Gateway identifier. If omitted, a unique ID will be generated.
     *
     * Must be 1-64 characters and match Cloudflare's AI Gateway ID pattern:
     * lowercase letters, numbers, underscores, and hyphens.
     *
     * @default ${app}-${stage}-${id}
     */
    id?: string;
    /**
     * Whether cached responses are invalidated when a request changes.
     *
     * @default false
     */
    cacheInvalidateOnUpdate?: boolean;
    /**
     * Cache time-to-live in seconds. Set to `null` to disable caching.
     *
     * @default null
     */
    cacheTtl?: number | null;
    /**
     * Whether AI Gateway stores request logs.
     *
     * @default true
     */
    collectLogs?: boolean;
    /**
     * Rate limiting interval in seconds. Set to `null` to disable rate limiting.
     *
     * @default null
     */
    rateLimitingInterval?: number | null;
    /**
     * Maximum requests allowed during the rate limiting interval. Set to `null`
     * to disable rate limiting.
     *
     * @default null
     */
    rateLimitingLimit?: number | null;
    /**
     * Rate limiting algorithm.
     *
     * @default "fixed"
     */
    rateLimitingTechnique?: GatewayRateLimitingTechnique;
    /**
     * Whether gateway authentication is enabled.
     */
    authentication?: boolean;
    /**
     * DLP configuration. The installed distilled Cloudflare client applies this
     * through the update API after gateway creation.
     */
    dlp?: GatewayDlp;
    /**
     * Whether this gateway is the account default.
     */
    isDefault?: boolean;
    /**
     * Maximum number of log entries to retain.
     */
    logManagement?: number | null;
    /**
     * Strategy used when retained logs reach `logManagement`.
     */
    logManagementStrategy?: GatewayLogManagementStrategy | null;
    /**
     * Whether Logpush is enabled for this gateway.
     */
    logpush?: boolean;
    /**
     * Public key used for Logpush encryption.
     */
    logpushPublicKey?: string | null;
    /**
     * OpenTelemetry export configuration.
     */
    otel?: GatewayOtel[] | null;
    /**
     * Store identifier used by the gateway.
     */
    storeId?: string | null;
    /**
     * Stripe usage export configuration.
     */
    stripe?: GatewayStripe | null;
    /**
     * Per-gateway spend limits (Cloudflare's replacement for the deprecated
     * account-level spending limit). Applied through the update API after
     * gateway creation.
     */
    spendLimits?: GatewaySpendLimits | null;
    /**
     * Whether Zero Data Retention is enabled.
     */
    zdr?: boolean;
};
export type Gateway = Resource<"Cloudflare.AI.Gateway", GatewayProps, {
    gatewayId: string;
    accountId: string;
    cacheInvalidateOnUpdate: boolean;
    cacheTtl: number | null;
    collectLogs: boolean;
    createdAt: string;
    modifiedAt: string;
    rateLimitingInterval: number | null;
    rateLimitingLimit: number | null;
    rateLimitingTechnique: GatewayRateLimitingTechnique;
    authentication: boolean;
    dlp: GatewayDlp | undefined;
    isDefault: boolean;
    logManagement: number;
    logManagementStrategy: GatewayLogManagementStrategy;
    logpush: boolean;
    logpushPublicKey: string | undefined;
    otel: GatewayOtel[] | undefined;
    storeId: string;
    stripe: GatewayStripe | undefined;
    spendLimits: GatewaySpendLimits | undefined;
    zdr: boolean;
}, never, Providers>;
export declare const isAiGateway: (value: unknown) => value is Gateway;
/**
 * A Cloudflare.AI. Gateway for observability, caching, rate limiting, and
 * governance across AI provider requests.
 *
 * AI Gateway gives your application a stable gateway ID and account-scoped
 * endpoint that can route model requests through Cloudflare. Once bound to a
 * Worker, `aiGateway.model({...})` returns an `effect/unstable/ai`
 * `LanguageModel` Layer so you use the standard `generateText` / `streamText`
 * APIs — provider-agnostic, with caching, rate limiting, retries, and a
 * unified request log handled by the gateway.
 * ### Creating a Gateway
 * **Example:** Basic gateway
 * ```typescript
 * const gateway = yield* Cloudflare.AI.Gateway("Gateway");
 * ```
 *
 * **Example:** Gateway with caching and rate limiting
 * ```typescript
 * const gateway = yield* Cloudflare.AI.Gateway("Gateway", {
 *   id: "my-gateway",
 *   cacheTtl: 300,
 *   cacheInvalidateOnUpdate: true,
 *   rateLimitingInterval: 60,
 *   rateLimitingLimit: 100,
 *   rateLimitingTechnique: "sliding",
 * });
 * ```
 *
 * ### Logging
 * **Example:** Gateway with log retention
 * ```typescript
 * const gateway = yield* Cloudflare.AI.Gateway("Gateway", {
 *   collectLogs: true,
 *   logManagement: 10000,
 *   logManagementStrategy: "STOP_INSERTING",
 * });
 * ```
 *
 * ### Binding into a Worker
 * **Example:** Bind the gateway and provide the runtime layer
 * `Cloudflare.AI.QueryGateway(gateway)` returns a typed, Effect-native client during the
 * Worker's Init phase. Provide `Cloudflare.AI.QueryGatewayBinding` once at the
 * bottom of the Init layer chain so every `QueryGateway(...)` resolves at runtime.
 * ```typescript
 * import * as Cloudflare from "alchemy/Cloudflare";
 * import * as Effect from "effect/Effect";
 * import { Gateway } from "./Gateway.ts";
 *
 * export default class Api extends Cloudflare.Worker<Api>()(
 *   "Api",
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     const aiGateway = yield* Cloudflare.AI.QueryGateway(Gateway);
 *
 *     return {
 *       fetch: Effect.gen(function* () {
 *         // …routes
 *       }),
 *     };
 *   }).pipe(Effect.provide(Cloudflare.AI.QueryGatewayBinding)),
 * ) {}
 * ```
 *
 * ### Building a LanguageModel
 * **Example:** `aiGateway.model(...)` -> Effect AI `LanguageModel`
 * Call `aiGateway.model({...})` with a Workers AI model id. It returns a
 * `Layer<LanguageModel, never, RuntimeContext>` directly — no API key and no
 * `Layer.unwrap`, since the binding handles auth and the gateway URL. Build it
 * in the Init phase; construction is pure.
 * ```typescript
 * const aiGateway = yield* Cloudflare.AI.QueryGateway(Gateway);
 *
 * const languageModel = aiGateway.model({
 *   model: "@cf/meta/llama-3.1-8b-instruct",
 *   parameters: { temperature: 0.7, maxTokens: 1024 },
 * });
 * ```
 *
 * ### Generating Text
 * **Example:** Generate text on a route
 * Provide the `languageModel` layer to the handler and call
 * `LanguageModel.generateText` like any other Effect. `Effect.orDie` collapses
 * `AiError` to a defect (a 500); use `Effect.catchTag("AiError", …)` for typed
 * handling instead.
 * ```typescript
 * import { LanguageModel } from "effect/unstable/ai";
 * import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
 *
 * fetch: Effect.gen(function* () {
 *   const response = yield* LanguageModel.generateText({
 *     prompt: "Say hello.",
 *   }).pipe(Effect.orDie);
 *   return yield* HttpServerResponse.json({
 *     text: response.text,
 *     usage: {
 *       inputTokens: response.usage.inputTokens.total,
 *       outputTokens: response.usage.outputTokens.total,
 *     },
 *   });
 * }).pipe(Effect.provide(languageModel));
 * ```
 *
 * ### Streaming Text
 * **Example:** Stream tokens as Server-Sent Events
 * `LanguageModel.streamText` returns a `Stream` of typed response parts.
 * `Stream.provide(languageModel)` keeps the model available for the whole
 * stream lifetime; pipe through `Sse.encode` for an SSE response.
 * ```typescript
 * import { LanguageModel } from "effect/unstable/ai";
 * import * as Stream from "effect/Stream";
 * import * as Sse from "effect/unstable/encoding/Sse";
 * import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
 *
 * const stream = LanguageModel.streamText({ prompt }).pipe(
 *   Stream.provide(languageModel),
 *   Sse.encode,
 * );
 * return HttpServerResponse.stream(stream, {
 *   headers: {
 *     "content-type": "text/event-stream",
 *     "cache-control": "no-cache",
 *     "x-accel-buffering": "no",
 *   },
 * });
 * ```
 *
 * ### Tuning the Gateway
 * **Example:** Production-grade caching, rate limits, and DLP
 * Every prop maps to an in-place update — no replacement, no downtime.
 * ```typescript
 * export const Gateway = Cloudflare.AI.Gateway("Gateway", {
 *   id: "prod-gateway",
 *   cacheTtl: 300,
 *   cacheInvalidateOnUpdate: true,
 *   rateLimitingInterval: 60,
 *   rateLimitingLimit: 100,
 *   rateLimitingTechnique: "sliding",
 *   collectLogs: true,
 *   logManagement: 100_000,
 *   logManagementStrategy: "DELETE_OLDEST",
 *   authentication: true,
 * });
 * ```
 *
 * ### Spend Limits
 * **Example:** Cap cost per rolling window
 * Per-gateway spend limits replace the deprecated account-level spending
 * limit. Each rule caps cumulative cost (in cents) over a rolling `window`
 * (in seconds), optionally scoped to specific models or providers.
 * ```typescript
 * const gateway = yield* Cloudflare.AI.Gateway("Gateway", {
 *   spendLimits: {
 *     enabled: true,
 *     rules: [
 *       { limitType: "cost", limit: 500_00, window: "1 day" }, // $500/day
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 * @product AI Gateway
 * @category AI
 */
export declare const Gateway: import("../../Resource.ts").ResourceClass<Gateway>;
export declare const GatewayResourceProvider: () => import("effect/Layer").Layer<Provider.Provider<Gateway>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | aiGateway.CloudflareOpContext>;
//# sourceMappingURL=Gateway.d.ts.map