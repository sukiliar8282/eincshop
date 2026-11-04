import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
/**
 * Per-origin connection tuning the cloudflared daemon applies when
 * forwarding requests upstream. Re-exports distilled's shape so every
 * server-recognised knob (TLS verify, keep-alives, HTTP/2, Access-protected
 * origin, etc.) is available without re-declaring the struct.
 */
export type OriginRequest = NonNullable<NonNullable<zeroTrust.PutTunnelCloudflaredConfigurationRequest["config"]>["originRequest"]>;
/**
 * One ingress rule in the tunnel's routing list. cloudflared matches each
 * incoming connection against these in order; the first match wins.
 *
 * Omit `hostname` (and `path`) on the *final* rule to make it the catch-all
 * — by convention a `service: "http_status:404"` entry. If you don't author
 * a catch-all, the provider appends one for you so the tunnel config stays
 * valid (Cloudflare rejects PUTs whose last rule has a hostname).
 */
export interface IngressRule {
    /**
     * Public or private hostname this rule matches. Omit for the catch-all
     * rule (which must be last in the list).
     */
    hostname?: string;
    /**
     * Upstream URL or pseudo-service. Common values:
     * - `http://service.namespace.svc.cluster.local:80` — forward to a K8s Service
     * - `https://10.0.0.5:8443` — forward to a private IP
     * - `http_status:404` — return a literal status code (used for the catch-all)
     * - `hello_world` — cloudflared's built-in test page
     */
    service: string;
    /**
     * Optional URL path prefix the rule matches. When omitted, the rule
     * matches every path for the hostname.
     */
    path?: string;
    /**
     * Per-rule origin tuning. Merges with (and overrides) the resource-level
     * `originRequest` defaults.
     */
    originRequest?: OriginRequest;
}
export interface ConfigurationProps {
    /**
     * UUID of the `cfd_tunnel` this configuration belongs to. Each tunnel
     * has a single configuration document, so this both identifies the
     * resource and gates lifecycle operations.
     *
     * Stable — changing the tunnel triggers replacement.
     *
     * Declared as plain `string` (not `string`) so it is statically
     * knowable inside `diff` for the replacement check.
     */
    tunnelId: string;
    /**
     * Ordered ingress rules. cloudflared evaluates them top-down and the
     * first match wins. The catch-all rule is appended automatically — do
     * not include a trailing `{ service: "http_status:404" }` here unless
     * you want it to land mid-list.
     */
    ingress: ReadonlyArray<IngressRule>;
    /**
     * Default origin-request tuning applied to every rule that doesn't set
     * its own. Equivalent to the top-level `originRequest` block in a
     * cloudflared YAML config.
     */
    originRequest?: OriginRequest;
    /**
     * Service for the auto-appended catch-all rule. cloudflared requires
     * the last rule to omit `hostname`; this controls what it returns when
     * no earlier rule matches.
     *
     * @default "http_status:404"
     */
    catchAllService?: string;
}
export interface ConfigurationAttributes {
    /** The tunnel this configuration belongs to. */
    tunnelId: string;
    /** Account that owns the tunnel. */
    accountId: string;
    /**
     * Cloudflare-side config version. Bumped on every PUT, even when the
     * payload is unchanged — surface it so downstream consumers can wait
     * on a specific revision if needed.
     */
    version: number | undefined;
}
export type Configuration = Resource<"Cloudflare.Tunnel.Configuration", ConfigurationProps, ConfigurationAttributes, never, Providers>;
/**
 * Routing configuration for a remotely-managed Cloudflare Tunnel.
 *
 * Cloudflare exposes the cfd_tunnel configuration as a single PUT-style
 * document per tunnel — `ingress` rules in order, plus optional default
 * `originRequest` settings. This resource owns that document; it is the
 * declarative equivalent of editing a tunnel's Public Hostname or Private
 * Hostname rules in the Zero Trust dashboard.
 *
 * The catch-all rule (final ingress entry with no hostname) is appended
 * automatically — Cloudflare rejects PUTs whose last rule has a hostname,
 * and forgetting it is a common foot-gun. Override the auto-appended
 * service via {@link ConfigurationProps.catchAllService}.
 * ### Routing a private hostname through a tunnel
 * **Example:** Map an internal admin UI through a Cloudflare Tunnel to a K8s Service
 * ```typescript
 * yield* Cloudflare.Tunnel.Configuration("AdminIngress", {
 *   tunnelId: tunnel.tunnelId,
 *   ingress: [
 *     {
 *       hostname: "cluster-admin.microagi",
 *       service: "http://research-ui.admin.svc.cluster.local:80",
 *     },
 *   ],
 * });
 * ```
 *
 * ### Multiple hostnames + custom catch-all
 * **Example:** Two services on one tunnel, returning 503 for unknown hosts
 * ```typescript
 * yield* Cloudflare.Tunnel.Configuration("Ingress", {
 *   tunnelId: tunnel.tunnelId,
 *   ingress: [
 *     { hostname: "ui.internal", service: "http://ui.app.svc.cluster.local:80" },
 *     { hostname: "api.internal", service: "http://api.app.svc.cluster.local:8080" },
 *   ],
 *   catchAllService: "http_status:503",
 * });
 * ```
 *
 * @resource
 * @product Tunnels
 * @category Cloudflare One (Zero Trust)
 */
export declare const Configuration: import("../../Resource.ts").ResourceClass<Configuration>;
export declare const ConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<Configuration>, never, CloudflareEnvironment | zeroTrust.CloudflareOpContext>;
//# sourceMappingURL=Configuration.d.ts.map