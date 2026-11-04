import * as Effect from "effect/Effect";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
/**
 * Shared scaffolding for the `*Local` tunnel services.
 *
 * Instead of minting a scoped {@link AccountApiToken} (the `*Binding` path), it
 * captures the ambient current-credentials context available during stack-eval
 * and builds a {@link TunnelAuth} that provides those credentials directly to
 * the cfd_tunnel HTTP ops. It then delegates to the same client builders the
 * `*Binding` variant uses.
 *
 * NOT exported from `index.ts` — this is internal scaffolding shared by the
 * three access-level Local layers.
 */
export const makeLocalTunnelClient = (makeClient) => Effect.gen(function* () {
    // Account + credentials are ambient during stack-eval (the stack's
    // providers layer). Capture the full context so cfd_tunnel HTTP ops can run
    // with the current credentials — no `host.bind`, no minted token.
    const { accountId } = yield* yield* CloudflareEnvironment;
    const context = yield* Effect.context();
    return Effect.fn(function* () {
        const auth = {
            authorize: (eff) => eff.pipe(Effect.provideContext(context)),
            accountId: Effect.succeed(accountId),
        };
        return makeClient(auth);
    });
});
//# sourceMappingURL=TunnelLocalBinding.js.map