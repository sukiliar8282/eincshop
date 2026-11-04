import * as Effect from "effect/Effect";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Credentials } from "../Credentials.ts";
import type { Namespace } from "./Namespace.ts";
import type { makeKVNamespaceHelpers } from "./NamespaceBinding.ts";
import type { KVAuth } from "./NamespaceHttp.ts";
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
export declare const makeLocalKVNamespaceBinding: <Client extends object>(options: {
    makeHttpClient: (auth: KVAuth, namespaceId: Effect.Effect<string>) => Client;
    makeNativeClient: (helpers: ReturnType<typeof makeKVNamespaceHelpers>) => Client;
}) => Effect.Effect<(namespace: Namespace) => Effect.Effect<Client, never, never>, never, CloudflareEnvironment | Credentials | HttpClient.HttpClient>;
//# sourceMappingURL=NamespaceLocal.d.ts.map