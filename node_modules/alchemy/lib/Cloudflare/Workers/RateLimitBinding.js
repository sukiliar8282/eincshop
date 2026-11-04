import * as Effect from "effect/Effect";
import { makeBindingLayer } from "./BindingLayer.js";
import { RateLimit, RateLimitError, } from "./RateLimit.js";
/**
 * The layer that provides the Effect-native interface for the Cloudflare
 * Workers Rate Limit binding.
 *
 * Provide it on the Worker effect (`Effect.provide(Cloudflare.Workers.RateLimitBinding)`)
 * so that yielding a {@link RateLimit} binding attaches the native `ratelimit`
 * binding to the surrounding Worker at deploy time and, at runtime, resolves to
 * the Effect-native {@link RateLimitClient}.
 */
export const RateLimitBinding = makeBindingLayer(RateLimit, (raw) => ({
    raw,
    limit: (options) => raw.pipe(Effect.flatMap((binding) => Effect.tryPromise({
        try: () => binding.limit(options),
        catch: (error) => new RateLimitError({
            message: error instanceof Error
                ? error.message
                : "Unknown RateLimit error",
            cause: error,
        }),
    }))),
}));
//# sourceMappingURL=RateLimitBinding.js.map