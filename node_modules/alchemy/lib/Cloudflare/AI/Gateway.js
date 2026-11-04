import * as aiGateway from "@distilled.cloud/cloudflare/ai-gateway";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { deepEqual, isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { isResourceOfType, Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
// Cloudflare's AI Gateway API uses 0 to mean "disabled" for cache TTL and
// rate limiting fields. Normalize back to null so user-facing semantics
// match what was passed in.
const nullIfZero = (value) => value == null || value === 0 ? null : value;
export const isAiGateway = (value) => isResourceOfType(value, "Cloudflare.AI.Gateway");
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
export const Gateway = Resource("Cloudflare.AI.Gateway", {
    aliases: ["Cloudflare.AiGateway"],
});
export const GatewayResourceProvider = () => Provider.succeed(Gateway, {
    stables: ["gatewayId", "accountId"],
    diff: Effect.fn(function* ({ id, olds = {}, news = {}, output }) {
        if (!isResolved(news))
            return undefined;
        const { accountId } = yield* yield* CloudflareEnvironment;
        const next = yield* desired(id, news);
        const oldGatewayId = output?.gatewayId ?? (yield* createGatewayId(id, olds.id));
        // Auto-generated ids are engine-owned: the deployed id stays
        // authoritative even if the generator would name this id differently
        // today. Only an explicit user-provided id can force a replace.
        const newGatewayId = news.id ?? oldGatewayId;
        if ((output?.accountId ?? accountId) !== accountId ||
            oldGatewayId !== newGatewayId) {
            return { action: "replace" };
        }
        const oldMutable = mutable(output ?? (yield* desired(id, olds)));
        const nextMutable = mutable(next);
        if (!deepEqual(oldMutable, nextMutable)) {
            return { action: "update" };
        }
    }),
    reconcile: Effect.fn(function* ({ id, news = {}, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        const gatewayId = output?.gatewayId ?? (yield* createGatewayId(id, news.id));
        // Observe — fetch the gateway's current state. The Cloudflare API
        // returns 404 when the gateway is missing, which we tolerate so the
        // reconciler can fall through to create.
        const observed = yield* aiGateway
            .getAiGateway({
            accountId: acct,
            id: gatewayId,
        })
            .pipe(Effect.catchTag("GatewayNotFound", () => Effect.succeed(undefined)));
        // Ensure — create if missing. Tolerate `GatewayAlreadyExists` for
        // idempotency: a peer reconciler may have created it concurrently,
        // or state persistence may have failed after a previous create.
        if (observed === undefined) {
            // Prefer the deployed id: regenerating would target a different
            // resource if the generator's output for this id ever drifts.
            const request = { ...(yield* createRequest(id, news)), id: gatewayId };
            yield* aiGateway
                .createAiGateway(request)
                .pipe(Effect.catchTag("GatewayAlreadyExists", () => aiGateway.getAiGateway({ accountId: acct, id: request.id })));
        }
        // Sync — the Cloudflare.AI. Gateway update API is a full PATCH that
        // overwrites all mutable fields. We always apply the desired shape
        // so adoption, drift, and routine updates all converge.
        // Prefer the deployed id: regenerating would target a different
        // resource if the generator's output for this id ever drifts.
        const update = {
            ...(yield* updateRequest(id, news, acct)),
            id: gatewayId,
        };
        const gateway = yield* aiGateway.updateAiGateway(update);
        return mapGateway(gateway, acct);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* aiGateway
            .deleteAiGateway({
            accountId: output.accountId,
            id: output.gatewayId,
        })
            .pipe(Effect.catchTag("GatewayNotFound", () => Effect.void));
    }),
    read: Effect.fn(function* ({ id, olds, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const gatewayId = output?.gatewayId ?? (yield* createGatewayId(id, olds?.id));
        const acct = output?.accountId ?? accountId;
        return yield* aiGateway
            .getAiGateway({
            accountId: acct,
            id: gatewayId,
        })
            .pipe(Effect.map((gateway) => mapGateway(gateway, acct)), Effect.catchTag("GatewayNotFound", () => Effect.succeed(undefined)));
    }),
    // AI Gateways are account-scoped; the list API returns the full gateway
    // object for every gateway in the account in one paginated collection.
    // Exhaustively paginate and hydrate each item into the same Attributes
    // shape `read` produces (via `mapGateway`).
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* aiGateway.listAiGateways.pages({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((gateway) => mapGateway(gateway, accountId)))));
    }),
});
const createGatewayId = (id, gatewayId) => Effect.gen(function* () {
    if (gatewayId)
        return gatewayId;
    return yield* createPhysicalName({
        id,
        maxLength: 64,
        lowercase: true,
    });
});
const desired = (id, props) => Effect.gen(function* () {
    return {
        gatewayId: yield* createGatewayId(id, props?.id),
        cacheInvalidateOnUpdate: props?.cacheInvalidateOnUpdate ?? false,
        cacheTtl: props?.cacheTtl ?? null,
        collectLogs: props?.collectLogs ?? true,
        rateLimitingInterval: props?.rateLimitingInterval ?? null,
        rateLimitingLimit: props?.rateLimitingLimit ?? null,
        rateLimitingTechnique: props?.rateLimitingTechnique ?? "fixed",
        // Defaults align with what Cloudflare's API returns for an
        // unconfigured gateway, so the reconciler converges to noop
        // when the user didn't explicitly set the field.
        authentication: props?.authentication ?? false,
        dlp: props?.dlp ?? undefined,
        isDefault: props?.isDefault ?? false,
        logManagement: props?.logManagement ?? 100_000,
        logManagementStrategy: props?.logManagementStrategy ?? "STOP_INSERTING",
        logpush: props?.logpush ?? false,
        logpushPublicKey: props?.logpushPublicKey ?? undefined,
        otel: props?.otel ?? undefined,
        storeId: props?.storeId ?? "",
        stripe: props?.stripe ?? undefined,
        spendLimits: resolveSpendLimits(props?.spendLimits),
        zdr: props?.zdr ?? false,
    };
});
// Resolve the user-facing spend limits into the API request shape: each rule's
// `window` is decoded from an Effect `Duration.Input` (e.g. `"1 day"`) into
// whole seconds. Done once here so both the create/update request body and the
// diff baseline carry seconds (matching what the API echoes back), keeping the
// reconciler's diff stable.
const resolveSpendLimits = (spendLimits) => {
    if (spendLimits == null)
        return undefined;
    return {
        enabled: spendLimits.enabled,
        rules: spendLimits.rules?.map((rule) => ({
            ...rule,
            window: Math.round(Duration.toSeconds(rule.window)),
        })),
    };
};
const mapGateway = (gateway, accountId) => ({
    gatewayId: gateway.id,
    accountId,
    // accountTag: gateway.accountTag ?? undefined,
    // internalId: gateway.internalId ?? undefined,
    cacheInvalidateOnUpdate: gateway.cacheInvalidateOnUpdate,
    cacheTtl: nullIfZero(gateway.cacheTtl),
    collectLogs: gateway.collectLogs,
    createdAt: gateway.createdAt,
    modifiedAt: gateway.modifiedAt,
    rateLimitingInterval: nullIfZero(gateway.rateLimitingInterval),
    rateLimitingLimit: nullIfZero(gateway.rateLimitingLimit),
    rateLimitingTechnique: gateway.rateLimitingTechnique ?? "fixed",
    authentication: gateway.authentication ?? false,
    // Distilled widened generated string enums to open unions (`string & {}`).
    dlp: (gateway.dlp ?? undefined),
    isDefault: gateway.isDefault ?? false,
    logManagement: gateway.logManagement ?? 100_000,
    logManagementStrategy: gateway.logManagementStrategy ?? "STOP_INSERTING",
    logpush: gateway.logpush ?? false,
    logpushPublicKey: gateway.logpushPublicKey ?? undefined,
    // The wire shape uses explicit nulls and an open content-type union —
    // normalize into our prop shape so attributes diff cleanly against props.
    otel: gateway.otel?.map((o) => ({
        url: o.url,
        headers: o.headers,
        ...(o.authorization != null ? { authorization: o.authorization } : {}),
        ...(o.contentType != null
            ? { contentType: o.contentType }
            : {}),
    })),
    storeId: gateway.storeId ?? "",
    stripe: gateway.stripe ?? undefined,
    spendLimits: normalizeSpendLimits(gateway.spendLimits),
    zdr: gateway.zdr ?? false,
});
// Normalize spend limits into the user-facing shape and drop server-managed
// noise so attributes diff cleanly against props. Cloudflare assigns a stable
// `id` to each rule and echoes back an explicit `enabled` flag — fold the
// per-rule `enabled` default (`true`) and `null`s away so a gateway the user
// configured without ids converges to a no-op instead of perpetual drift.
const normalizeSpendLimits = (spendLimits) => {
    if (spendLimits == null)
        return undefined;
    return {
        enabled: spendLimits.enabled ?? false,
        rules: (spendLimits.rules ?? []).map((rule) => ({
            limit: rule.limit,
            limitType: rule.limitType,
            window: rule.window,
            enabled: rule.enabled ?? true,
            ...(rule.id != null ? { id: rule.id } : {}),
            ...(rule.metadata != null && Object.keys(rule.metadata).length > 0
                ? { metadata: rule.metadata }
                : {}),
            ...(rule.model != null ? { model: rule.model } : {}),
            ...(rule.provider != null ? { provider: rule.provider } : {}),
            ...(rule.technique != null
                ? { technique: rule.technique }
                : {}),
        })),
    };
};
const mutable = (gateway) => ({
    cacheInvalidateOnUpdate: gateway.cacheInvalidateOnUpdate,
    cacheTtl: gateway.cacheTtl,
    collectLogs: gateway.collectLogs,
    rateLimitingInterval: gateway.rateLimitingInterval,
    rateLimitingLimit: gateway.rateLimitingLimit,
    rateLimitingTechnique: gateway.rateLimitingTechnique,
    authentication: gateway.authentication,
    dlp: gateway.dlp,
    isDefault: gateway.isDefault,
    logManagement: gateway.logManagement,
    logManagementStrategy: gateway.logManagementStrategy,
    logpush: gateway.logpush,
    logpushPublicKey: gateway.logpushPublicKey,
    otel: gateway.otel,
    storeId: gateway.storeId,
    stripe: gateway.stripe,
    spendLimits: spendLimitsForDiff(gateway.spendLimits),
    zdr: gateway.zdr,
});
// Compare spend limits by their user-meaningful shape: drop the
// server-assigned rule `id` (absent on freshly-declared props) and apply the
// per-rule `enabled` default so desired (from props) and observed (from the
// API) converge to a no-op when semantically equal.
const spendLimitsForDiff = (spendLimits) => {
    if (spendLimits == null)
        return undefined;
    return {
        enabled: spendLimits.enabled ?? false,
        rules: (spendLimits.rules ?? []).map((rule) => ({
            limit: rule.limit,
            limitType: rule.limitType,
            window: rule.window,
            enabled: rule.enabled ?? true,
            ...(rule.metadata != null && Object.keys(rule.metadata).length > 0
                ? { metadata: rule.metadata }
                : {}),
            ...(rule.model != null ? { model: rule.model } : {}),
            ...(rule.provider != null ? { provider: rule.provider } : {}),
            ...(rule.technique != null ? { technique: rule.technique } : {}),
        })),
    };
};
const createRequest = Effect.fn(function* (id, props) {
    const next = yield* desired(id, props);
    const { accountId } = yield* yield* CloudflareEnvironment;
    return {
        accountId,
        id: next.gatewayId,
        cacheInvalidateOnUpdate: next.cacheInvalidateOnUpdate,
        cacheTtl: next.cacheTtl,
        collectLogs: next.collectLogs,
        rateLimitingInterval: next.rateLimitingInterval,
        rateLimitingLimit: next.rateLimitingLimit,
        rateLimitingTechnique: next.rateLimitingTechnique,
        authentication: next.authentication,
        logManagement: next.logManagement,
        logManagementStrategy: next.logManagementStrategy,
        logpush: next.logpush,
        logpushPublicKey: next.logpushPublicKey,
        zdr: next.zdr,
    };
});
const updateRequest = Effect.fn(function* (id, props, accountId) {
    const next = yield* desired(id, props);
    return {
        accountId,
        id: next.gatewayId,
        cacheInvalidateOnUpdate: next.cacheInvalidateOnUpdate,
        cacheTtl: next.cacheTtl,
        collectLogs: next.collectLogs,
        rateLimitingInterval: next.rateLimitingInterval,
        rateLimitingLimit: next.rateLimitingLimit,
        rateLimitingTechnique: next.rateLimitingTechnique,
        authentication: next.authentication,
        dlp: next.dlp,
        logManagement: next.logManagement,
        logManagementStrategy: next.logManagementStrategy,
        logpush: next.logpush,
        logpushPublicKey: next.logpushPublicKey,
        otel: next.otel,
        storeId: next.storeId,
        stripe: next.stripe,
        spendLimits: next.spendLimits,
        zdr: next.zdr,
    };
});
//# sourceMappingURL=Gateway.js.map