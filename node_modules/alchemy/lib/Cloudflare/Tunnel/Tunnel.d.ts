import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
export type TunnelProps = {
    /**
     * Name for the tunnel. If omitted, a unique name will be generated.
     *
     * Tunnel names are immutable -- changing the name triggers replacement.
     *
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Secret used by the tunnel connector. If omitted, Cloudflare generates one.
     * Must be at least 32 bytes encoded as base64.
     */
    tunnelSecret?: Redacted.Redacted<string>;
    /**
     * Where the tunnel configuration lives.
     * - `"cloudflare"` - managed remotely via the API (default)
     * - `"local"` - managed via a YAML file on the origin
     *
     * @default "cloudflare"
     */
    configSrc?: "cloudflare" | "local";
    /**
     * Ingress rules describing how requests are routed. Must end with a
     * catch-all rule (e.g. `{ service: "http_status:404" }`). Only honored when
     * `configSrc` is `"cloudflare"`.
     */
    ingress?: Tunnel.IngressRule[];
    /**
     * Origin request configuration applied to all rules. Only honored when
     * `configSrc` is `"cloudflare"`.
     */
    originRequest?: Tunnel.OriginRequestConfig;
    /**
     * Whether to adopt an existing tunnel with the same name when create fails.
     *
     * @default false
     */
    adopt?: boolean;
};
export declare namespace Tunnel {
    /**
     * Ingress rule describing how a hostname or path is routed.
     */
    interface IngressRule {
        hostname?: string;
        service: string;
        path?: string;
        originRequest?: OriginRequestConfig;
    }
    /**
     * Origin request configuration applied per-rule or globally.
     */
    interface OriginRequestConfig {
        connectTimeout?: number;
        tlsTimeout?: number;
        tcpKeepAlive?: number;
        noHappyEyeballs?: boolean;
        keepAliveConnections?: number;
        keepAliveTimeout?: number;
        http2Origin?: boolean;
        httpHostHeader?: string;
        caPool?: string;
        noTLSVerify?: boolean;
        disableChunkedEncoding?: boolean;
        proxyType?: string;
        matchSNItoHost?: boolean;
        originServerName?: string;
    }
}
export type Tunnel = Resource<"Cloudflare.Tunnel.Tunnel", TunnelProps, {
    tunnelId: string;
    tunnelName: string;
    accountTag: string | undefined;
    accountId: string;
    createdAt: string | undefined;
    deletedAt: string | undefined;
    configSrc: "cloudflare" | "local";
    token: Redacted.Redacted<string>;
}, never, Providers>;
/**
 * A Cloudflare Tunnel that establishes a secure connection from your origin to
 * Cloudflare's edge.
 * ### Creating a Tunnel
 * **Example:** Basic tunnel
 * ```typescript
 * const tunnel = yield* Cloudflare.Tunnel.Tunnel("MyTunnel");
 * // Run the connector with: cloudflared tunnel run --token <Redacted.value(tunnel.token)>
 * ```
 *
 * **Example:** Tunnel with ingress rules
 * ```typescript
 * const tunnel = yield* Cloudflare.Tunnel.Tunnel("Web", {
 *   ingress: [
 *     { hostname: "app.example.com", service: "http://localhost:3000" },
 *     { service: "http_status:404" },
 *   ],
 * });
 * ```
 *
 * ### Managing Tunnels at Runtime
 * The `Tunnel` resource manages a single, statically-declared tunnel as part of
 * a stack. To create, read, update, or delete tunnels *on the fly* from inside
 * a deployed Worker, bind one of the runtime tunnel clients instead. Each
 * provisions a least-privilege {@link AccountApiToken} and injects it into the
 * Worker:
 *
 * - {@link ReadTunnel} — read-only (`get`, `list`, `getToken`,
 *   `getConfiguration`); scoped to `Cloudflare Tunnel Read`.
 * - {@link WriteTunnel} — mutating (`create`, `update`, `delete`,
 *   `putConfiguration`); scoped to `Cloudflare Tunnel Write`.
 * - {@link ReadWriteTunnel} — the full CRUD surface; scoped to both.
 *
 * **Example:** Create a tunnel on demand from a Worker
 * ```typescript
 * // init
 * const tunnels = yield* Cloudflare.Tunnel.ReadWriteTunnel();
 *
 * return {
 *   fetch: Effect.gen(function* () {
 *     const tunnel = yield* tunnels.create({ name: "on-demand-tunnel" });
 *     const token = yield* tunnels.getToken(tunnel.id!);
 *     return HttpServerResponse.json({ id: tunnel.id, token });
 *   }),
 * };
 * ```
 *
 * @resource
 * @product Tunnels
 * @category Cloudflare One (Zero Trust)
 */
export declare const Tunnel: import("../../Resource.ts").ResourceClass<Tunnel>;
export declare const TunnelProvider: () => import("effect/Layer").Layer<Provider.Provider<Tunnel>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | zeroTrust.CloudflareOpContext>;
//# sourceMappingURL=Tunnel.d.ts.map