import type { CreateTunnelCloudflaredError, CreateTunnelCloudflaredRequest, CreateTunnelCloudflaredResponse, DeleteTunnelCloudflaredError, DeleteTunnelCloudflaredResponse, PatchTunnelCloudflaredError, PatchTunnelCloudflaredRequest, PatchTunnelCloudflaredResponse, PutTunnelCloudflaredConfigurationError, PutTunnelCloudflaredConfigurationRequest, PutTunnelCloudflaredConfigurationResponse } from "@distilled.cloud/cloudflare/zero-trust";
import * as Effect from "effect/Effect";
import * as Binding from "../../Binding.ts";
import type { Worker } from "../Workers/Worker.ts";
import type { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { RuntimeContext } from "../../RuntimeContext.ts";
import { type TunnelAuth } from "./TunnelBinding.ts";
/**
 * Binding that lets a Worker create, update, and delete Cloudflare Tunnels at
 * runtime.
 *
 * Creates a scoped {@link AccountApiToken} with only the `Cloudflare Tunnel
 * Write` permission and binds its outputs into the Worker (the token value as a
 * `secret_text` binding) so runtime code can authenticate.
 *
 * @remarks
 *
 * `WriteTunnel` is a single identifier that is simultaneously the binding's
 * Context tag, its type, and the callable — `yield* Cloudflare.Tunnel.WriteTunnel()`.
 *
 * ### Mutating tunnels at runtime
 * **Example:** Bind the write client
 * Bind once in the Init phase; every method is available on the returned client.
 * ```typescript
 * const tunnels = yield* Cloudflare.Tunnel.WriteTunnel();
 * ```
 *
 * **Example:** Create a tunnel
 * ```typescript
 * const tunnel = yield* tunnels.create({ name: "on-demand-tunnel" });
 * ```
 *
 * **Example:** Push ingress configuration
 * ```typescript
 * yield* tunnels.putConfiguration(tunnel.id!, {
 *   ingress: [
 *     { hostname: "app.example.com", service: "http://localhost:3000" },
 *     { service: "http_status:404" },
 *   ],
 * });
 * ```
 *
 * **Example:** Rename and delete a tunnel
 * ```typescript
 * yield* tunnels.update(tunnel.id!, { name: "renamed-tunnel" });
 * yield* tunnels.delete(tunnel.id!);
 * ```
 *
 * ### Runtime Layer
 * Provide {@link WriteTunnelBinding} in the Worker's runtime layer.
 * ```typescript
 * Effect.provide(Cloudflare.Tunnel.WriteTunnelBinding)
 * ```
 *
 * @binding
 * @product Tunnels
 * @category Cloudflare One (Zero Trust)
 */
export interface WriteTunnel extends Binding.Service<WriteTunnel, "Cloudflare.Tunnel.WriteTunnel", () => Effect.Effect<WriteTunnelClient, never, Worker | CloudflareEnvironment>> {
}
export declare const WriteTunnel: WriteTunnel;
/** Create-tunnel request, minus the account id (supplied by the binding). */
export type CreateTunnelRequest = Omit<CreateTunnelCloudflaredRequest, "accountId">;
/** Update-tunnel request, minus the account id and tunnel id (positional). */
export type UpdateTunnelRequest = Omit<PatchTunnelCloudflaredRequest, "accountId" | "tunnelId">;
/** Tunnel configuration body, minus the account id and tunnel id (positional). */
export type ConfigurationBody = NonNullable<PutTunnelCloudflaredConfigurationRequest["config"]>;
/**
 * Mutating tunnel operations. Backed by the `Cloudflare Tunnel Write`
 * permission group.
 */
export interface WriteTunnelClient {
    /** Create a new tunnel. */
    create(request: CreateTunnelRequest): Effect.Effect<CreateTunnelCloudflaredResponse, CreateTunnelCloudflaredError, RuntimeContext>;
    /** Update a tunnel's mutable fields (name, secret). */
    update(tunnelId: string, request: UpdateTunnelRequest): Effect.Effect<PatchTunnelCloudflaredResponse, PatchTunnelCloudflaredError, RuntimeContext>;
    /** Delete a tunnel by id. */
    delete(tunnelId: string): Effect.Effect<DeleteTunnelCloudflaredResponse, DeleteTunnelCloudflaredError, RuntimeContext>;
    /** Replace the remotely-managed configuration (ingress rules) for a tunnel. */
    putConfiguration(tunnelId: string, config: ConfigurationBody): Effect.Effect<PutTunnelCloudflaredConfigurationResponse, PutTunnelCloudflaredConfigurationError, RuntimeContext>;
}
/** Build the write client over an injectable {@link TunnelAuth}. */
export declare const writeClient: (auth: TunnelAuth) => WriteTunnelClient;
//# sourceMappingURL=WriteTunnel.d.ts.map