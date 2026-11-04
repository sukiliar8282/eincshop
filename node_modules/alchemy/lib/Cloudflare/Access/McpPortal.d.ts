import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Access.McpPortal";
type TypeId = typeof TypeId;
export interface McpPortalProps {
    /**
     * The client-supplied portal identifier. Immutable — changing it
     * triggers a replacement. If omitted, a deterministic id is generated
     * from the app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    portalId?: string;
    /**
     * Display name of the portal. If omitted, the portal id is reused.
     * @default the portal id
     */
    name?: string;
    /**
     * The hostname the portal is served on. Must belong to a zone on the
     * account.
     */
    hostname: string;
    /**
     * Optional description of the portal.
     */
    description?: string;
    /**
     * Allow remote code execution in Dynamic Workers (beta). When omitted,
     * the server-side default applies (observed: `true`).
     */
    allowCodeMode?: boolean;
    /**
     * Route outbound MCP traffic through the Zero Trust Secure Web
     * Gateway.
     * @default false
     */
    secureWebGateway?: boolean;
}
export type McpPortalAttributes = {
    /** The portal id. */
    portalId: string;
    /** Account that owns the portal. */
    accountId: string;
    /** Observed display name. */
    name: string;
    /** Observed portal hostname. */
    hostname: string;
    /** Observed description, if any. */
    description: string | undefined;
    /** Whether Dynamic Workers code mode is allowed. */
    allowCodeMode: boolean;
    /** Whether outbound MCP traffic routes through the gateway. */
    secureWebGateway: boolean;
    /** RFC 3339 timestamp of when the portal was created, if reported. */
    createdAt: string | undefined;
};
export type McpPortal = Resource<TypeId, McpPortalProps, McpPortalAttributes, never, Providers>;
/**
 * A Cloudflare Zero Trust **AI Controls MCP portal** — a hosted gateway
 * that aggregates MCP servers behind a single Access-protected hostname
 * so administrators can govern which AI tools and prompts are exposed to
 * users.
 *
 * The product surface is in beta and requires the AI Controls
 * entitlement; accounts without it receive the typed `Forbidden` error
 * on all writes. Attaching servers to the portal is managed out of band
 * (a future `Cloudflare.Access.McpServer` resource).
 * ### Creating an MCP portal
 * **Example:** Minimal portal
 * ```typescript
 * const portal = yield* Cloudflare.Access.McpPortal("AiPortal", {
 *   hostname: "mcp.example.com",
 * });
 * ```
 *
 * **Example:** Portal with gateway egress
 * ```typescript
 * const portal = yield* Cloudflare.Access.McpPortal("AiPortal", {
 *   hostname: "mcp.example.com",
 *   description: "Company-approved AI tools",
 *   secureWebGateway: true,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/access-controls/ai-controls/
 *
 * @resource
 * @product Access
 * @category Cloudflare One (Zero Trust)
 */
export declare const McpPortal: import("../../Resource.ts").ResourceClass<McpPortal>;
/**
 * Returns true if the given value is an McpPortal resource.
 */
export declare const isMcpPortal: (value: unknown) => value is McpPortal;
export declare const McpPortalProvider: () => import("effect/Layer").Layer<Provider.Provider<McpPortal>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | zeroTrust.CloudflareOpContext>;
export {};
//# sourceMappingURL=McpPortal.d.ts.map