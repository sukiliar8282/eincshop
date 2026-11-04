import * as Effect from "effect/Effect";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Credentials } from "../Credentials.ts";
import type { TunnelAuth } from "./TunnelBinding.ts";
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
export declare const makeLocalTunnelClient: <Client>(makeClient: (auth: TunnelAuth) => Client) => Effect.Effect<() => Effect.Effect<Client, never, never>, never, CloudflareEnvironment | Credentials | HttpClient.HttpClient>;
//# sourceMappingURL=TunnelLocalBinding.d.ts.map