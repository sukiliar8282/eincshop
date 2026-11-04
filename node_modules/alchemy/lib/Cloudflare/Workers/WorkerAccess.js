import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
export class WorkerAccessIdentityError extends Data.TaggedError("WorkerAccessIdentityError") {
}
const makeAccessContext = (raw) => ({
    aud: raw.aud,
    getIdentity: () => Effect.tryPromise({
        try: () => raw.getIdentity(),
        catch: (cause) => new WorkerAccessIdentityError({
            message: cause instanceof Error
                ? cause.message
                : "Unknown Access identity resolution error",
            cause,
        }),
    }),
});
/** The env key `dev.access` is lowered into by the local worker provider. */
export const DEV_ACCESS_ENV_KEY = "ALCHEMY_DEV_ACCESS";
/**
 * Resolve the current request's Access context: workerd's native
 * `ctx.access` when the request came through Cloudflare Access, the
 * `dev.access` simulation under `alchemy dev`, and `undefined` (an
 * unauthenticated request) otherwise. Backs the `access` member of the
 * per-event `WorkerExecutionContext`.
 */
export const resolveAccessContext = (ctx, env) => {
    // Deployed behind Access: workerd populates ctx.access natively.
    const native = ctx
        .access;
    if (native !== undefined) {
        return makeAccessContext(native);
    }
    // Local dev: the Worker's `dev.access` config is lowered into an env
    // binding; absent config simulates an unauthenticated request.
    const dev = env?.[DEV_ACCESS_ENV_KEY];
    if (dev !== undefined) {
        return {
            aud: dev.aud ?? "dev",
            getIdentity: () => Effect.succeed(dev.identity),
        };
    }
    return undefined;
};
//# sourceMappingURL=WorkerAccess.js.map