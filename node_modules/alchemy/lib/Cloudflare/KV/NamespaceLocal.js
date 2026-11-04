import * as Effect from "effect/Effect";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { dispatchByMode } from "../LocalGateway.js";
import { makeProxyKVNamespaceHelpers } from "./LocalKVGateway.js";
/**
 * Shared scaffolding for the `*Local` KV services.
 *
 * Instead of minting a scoped {@link AccountApiToken} (the `*Http` path) or
 * resolving a native Worker binding (the `*Binding` path), it captures the
 * ambient current-credentials context available during stack-eval and
 * builds the client per resolved namespace id:
 *
 * - a REAL id gets the HTTP client (same builders as the `*Http` variant,
 *   authorized with the current credentials — no `host.bind`, no minted
 *   token);
 * - a `dev:` id (local emulation under `alchemy dev`) gets the native
 *   binding client (same builders as the `*Binding` variant) over a scoped
 *   platform-proxy gateway (see `LocalKVGateway.ts`).
 *
 * The id resolves lazily at apply time, so the returned client dispatches
 * per call.
 *
 * NOT exported from `index.ts` — this is internal scaffolding shared by the
 * three access-level Local layers.
 */
export const makeLocalKVNamespaceBinding = (options) => Effect.gen(function* () {
    // Account + credentials are ambient during stack-eval (the stack's
    // providers layer). Capture the full context so KV HTTP ops can run with
    // the current credentials — no `host.bind`, no minted token.
    const { accountId } = yield* yield* CloudflareEnvironment;
    const context = yield* Effect.context();
    // The FULL ambient context, for the dev-mode gateway: booting an
    // ephemeral workerd needs the platform services and the Cloudflare
    // environment, all present during stack-eval but not statically
    // enumerable here.
    const ambient = yield* Effect.context();
    return Effect.fn(function* (namespace) {
        // Deferred accessor — resolves the namespaceId against the tracker at
        // apply time (in an Action, that's the engine's resolve context).
        const namespaceId = yield* namespace.namespaceId;
        const auth = {
            authorize: (eff) => eff.pipe(Effect.provideContext(context)),
            accountId: Effect.succeed(accountId),
        };
        const httpClient = options.makeHttpClient(auth, namespaceId);
        return dispatchByMode(namespaceId, httpClient, (id) => options.makeNativeClient(makeProxyKVNamespaceHelpers(id, ambient)));
    });
});
//# sourceMappingURL=NamespaceLocal.js.map