import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Gateway.ProxyEndpoint";
type TypeId = typeof TypeId;
/**
 * The kind of proxy endpoint. `ip` endpoints admit traffic from a source
 * CIDR allowlist (Enterprise only); `identity` endpoints authenticate
 * per-user. Immutable — changing the kind triggers a replacement.
 */
export type ProxyEndpointKind = "ip" | "identity";
export interface ProxyEndpointProps {
    /**
     * Display name for the proxy endpoint. Used as a stable identifier so
     * the provider can locate it by name during adoption / state recovery.
     * If omitted, a unique name is generated from the app, stage, and
     * logical ID.
     *
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * The proxy endpoint kind. `ip` endpoints (source-CIDR allowlist)
     * require an Enterprise plan; `identity` endpoints work on all Zero
     * Trust plans. Immutable — changing the kind triggers a replacement.
     *
     * @default "ip"
     */
    kind?: ProxyEndpointKind;
    /**
     * Source CIDRs allowed to connect through the endpoint (e.g.
     * `203.0.113.1/32`). Required for (and only meaningful on) `ip`-kind
     * endpoints. Mutable — patched in place.
     */
    ips?: string[];
}
export interface ProxyEndpointAttributes {
    /** UUID of the proxy endpoint, assigned by Cloudflare. */
    proxyEndpointId: string;
    /** Cloudflare account that owns the proxy endpoint. */
    accountId: string;
    /** Display name of the proxy endpoint. */
    name: string;
    /** The proxy endpoint kind. */
    kind: ProxyEndpointKind;
    /** Source CIDR allowlist (empty for identity-kind endpoints). */
    ips: string[];
    /**
     * Server-assigned subdomain. The PAC-file proxy hostname is
     * `<subdomain>.proxy.cloudflare-gateway.com`.
     */
    subdomain: string | undefined;
    /** ISO8601 creation timestamp. */
    createdAt: string | undefined;
    /** ISO8601 last-update timestamp. */
    updatedAt: string | undefined;
}
export type ProxyEndpoint = Resource<TypeId, ProxyEndpointProps, ProxyEndpointAttributes, never, Providers>;
/**
 * A Cloudflare Zero Trust Gateway proxy endpoint — an agentless HTTP
 * proxy for forwarding traffic to Gateway without installing the WARP
 * client, typically wired up via a PAC file pointing at the endpoint's
 * server-assigned `subdomain`.
 *
 * `ip`-kind endpoints admit traffic from a source-CIDR allowlist and
 * require an Enterprise plan (Cloudflare error code 2009 otherwise);
 * `identity`-kind endpoints authenticate individual users and work on all
 * Zero Trust plans. The kind is immutable; name and `ips` converge in
 * place. Accounts are limited to a small number of proxy endpoints, so
 * prefer reusing one per account.
 * ### Creating a Proxy Endpoint
 * **Example:** Identity-based endpoint (all plans)
 * ```typescript
 * const proxy = yield* Cloudflare.Gateway.ProxyEndpoint("UserProxy", {
 *   kind: "identity",
 * });
 * // PAC file target:
 * const host = `${proxy.subdomain}.proxy.cloudflare-gateway.com`;
 * ```
 *
 * **Example:** IP allowlist endpoint (Enterprise)
 * ```typescript
 * const proxy = yield* Cloudflare.Gateway.ProxyEndpoint("OfficeProxy", {
 *   kind: "ip",
 *   ips: ["203.0.113.1/32"],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/connections/connect-devices/agentless/pac-files/
 *
 * @resource
 * @product Gateway
 * @category Cloudflare One (Zero Trust)
 */
export declare const ProxyEndpoint: import("../../Resource.ts").ResourceClass<ProxyEndpoint>;
/**
 * Returns true if the given value is a ProxyEndpoint resource.
 */
export declare const isProxyEndpoint: (value: unknown) => value is ProxyEndpoint;
export declare const ProxyEndpointProvider: () => import("effect/Layer").Layer<Provider.Provider<ProxyEndpoint>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | zeroTrust.CloudflareOpContext>;
export {};
//# sourceMappingURL=ProxyEndpoint.d.ts.map