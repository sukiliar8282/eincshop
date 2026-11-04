import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
import { type PolicyDecision, type PolicyExcludeRuleInput, type PolicyRequireRuleInput, type PolicyRuleInput } from "./Policy.ts";
/**
 * Application type literal — every value Cloudflare's Access service
 * recognises. Stable across reconciles; changing it triggers a replacement.
 */
export type ApplicationType = "self_hosted" | "saas" | "ssh" | "vnc" | "bookmark" | "warp" | "infrastructure" | "app_launcher" | "biso" | "dash_sso";
/**
 * A destination that this Access application protects.
 *
 * Cloudflare supports these destination flavours:
 * - `public` — a public hostname/URI you own in Cloudflare (the legacy
 *   `domain` field on `ApplicationProps` covers the simple case).
 * - `private` — a hostname or CIDR reachable through a Cloudflare Tunnel.
 *   Traffic from WARP-enrolled devices is intercepted and forwarded
 *   through the tunnel; identity is enforced before forwarding.
 * - `via_mcp_server_portal` — routes via a managed MCP server portal.
 * - `worker` / `preview_worker` — a specific Cloudflare Worker's production
 *   traffic (custom domains, routes, `workers.dev`) or its version preview
 *   URLs, keyed by the Worker's immutable ID (its `workerId` attribute).
 *   Usually you don't write these by hand — set the `access` prop on the
 *   `Cloudflare.Worker` instead, and the Worker enrolls itself into the
 *   application.
 * - `all_workers` / `all_preview_workers` — every Worker on the account
 *   (including ones created later), production or preview traffic
 *   respectively. Hostname-level policies take precedence over Worker-level
 *   policies, which take precedence over these account-level policies.
 */
export type ApplicationDestination = {
    type: "public";
    uri: string;
} | {
    type: "private";
    hostname?: string;
    cidr?: string;
    l4Protocol?: "tcp" | "udp";
    portRange?: string;
    vnetId?: string;
} | {
    type: "via_mcp_server_portal";
    mcpServerId: string;
} | {
    type: "worker";
    workerId: string;
} | {
    type: "preview_worker";
    workerId: string;
} | {
    type: "all_workers";
} | {
    type: "all_preview_workers";
};
/**
 * Configuration for an OAuth authorization flow managed by Cloudflare Access.
 */
export interface OAuthConfiguration {
    /** Whether Access acts as the OAuth authorization server. */
    enabled?: boolean;
    /** OAuth grant and token lifetimes. */
    grant?: {
        /** Lifetime of issued access tokens, as a Go-style duration. */
        accessTokenLifetime?: string;
        /** Lifetime of the authorization session, as a Go-style duration. */
        sessionDuration?: string;
    };
    /** Settings for OAuth dynamic client registration. */
    dynamicClientRegistration?: {
        /** Whether dynamic client registration is enabled. */
        enabled?: boolean;
        /** Explicit redirect URIs that dynamically registered clients may use. */
        allowedUris?: ReadonlyArray<string>;
        /** Whether any localhost redirect URI is allowed. */
        allowAnyOnLocalhost?: boolean;
        /** Whether any loopback-address redirect URI is allowed. */
        allowAnyOnLoopback?: boolean;
    };
}
/**
 * An Access policy defined inline on (and owned by) an application: created
 * with the application, updated in place, and deleted with it. Uses the same
 * rule model as the reusable `Cloudflare.Access.Policy` resource.
 */
export interface InlineApplicationPolicy {
    /** The action Access takes when a user matches this policy. */
    decision: PolicyDecision;
    /** Rules evaluated with OR — matching any one grants the policy. */
    include: ReadonlyArray<PolicyRuleInput>;
    /** Rules evaluated with NOT — matching any one denies the policy. */
    exclude?: ReadonlyArray<PolicyExcludeRuleInput>;
    /** Rules evaluated with AND — all must match. */
    require?: ReadonlyArray<PolicyRequireRuleInput>;
    /** Display name. Cloudflare generates one when omitted. */
    name?: string;
    /** Execution order of this policy within the application. */
    precedence?: number;
    /** Session lifetime for this policy, e.g. `"24h"`, `"2h45m"`. */
    sessionDuration?: string;
    /** Require admin approval at the start of each session. */
    approvalRequired?: boolean;
    /** Administrators who can approve a temporary authentication request. */
    approvalGroups?: ReadonlyArray<{
        approvalsNeeded: number;
        emailAddresses?: ReadonlyArray<string>;
        emailListUuid?: string;
    }>;
    /** Serve the application in an isolated browser for matching users. */
    isolationRequired?: boolean;
    /** Require a login justification from matching users. */
    purposeJustificationRequired?: boolean;
    /** Custom message shown on the justification screen. */
    purposeJustificationPrompt?: string;
}
export interface ApplicationProps {
    /**
     * The Access application type.
     *
     * Cloudflare requires a single global `warp` application per account; the
     * provider's observe step special-cases this by scanning the account for an
     * existing `warp` app when no `applicationId` is cached.
     *
     * Immutable — changing the type triggers a replace.
     */
    type: ApplicationType;
    /**
     * Human-readable display name. If omitted, a deterministic physical name
     * is generated from the app/stage/logical-id.
     */
    name?: string;
    /**
     * Primary hostname and path secured by Access. Required for `self_hosted`
     * apps; ignored on the request for `warp` (Cloudflare auto-fills it with
     * `${authDomain}/warp`) and `saas` (Cloudflare uses the OIDC issuer).
     */
    domain?: string;
    /**
     * Destinations this application protects. Use for the modern multi-
     * destination model — required for **Access for private apps** flows
     * where traffic to a private hostname/CIDR is intercepted by WARP and
     * routed through a Cloudflare Tunnel, with Access enforcing identity
     * before the request reaches the upstream service.
     *
     * For simple public-hostname apps, set `domain` instead. The two are
     * not mutually exclusive — Cloudflare treats `domain` as a shorthand
     * for adding a single `{ type: "public" }` destination.
     *
     * @example
     * ```ts
     * destinations: [
     *   { type: "private", hostname: "admin.internal" },
     * ]
     * ```
     */
    destinations?: ReadonlyArray<ApplicationDestination>;
    /**
     * Optional OAuth authorization-server configuration managed by Access.
     * Use this for non-browser clients such as MCP clients that authenticate
     * through OAuth and may register redirect URIs dynamically.
     */
    oauthConfiguration?: OAuthConfiguration;
    /**
     * Token TTL for sessions issued by this application. Accepts Go-style
     * duration strings, e.g. `"24h"`, `"720h"`, `"2h45m"`.
     *
     * @default "24h"
     */
    sessionDuration?: string;
    /**
     * Allowed identity-provider UUIDs. Defaults (on Cloudflare's side) to every
     * IdP configured for the account.
     */
    allowedIdps?: string[];
    /**
     * Skip the IdP picker when only one IdP is allowed. Requires `allowedIdps`
     * to contain exactly one entry.
     *
     * @default false
     */
    autoRedirectToIdentity?: boolean;
    /**
     * Whether the app should be visible in the App Launcher dashboard.
     */
    appLauncherVisible?: boolean;
    /**
     * Tags applied to this application for filtering in the App Launcher.
     */
    tags?: string[];
    /**
     * Access policies that gate access to this application, in ascending
     * order of precedence.
     *
     * Each entry can be:
     * - an **inline policy** owned by this application —
     *   `{ decision, include, ... }` with the same rule model as
     *   `Cloudflare.Access.Policy` (created, updated, and deleted with the
     *   application; no separate resource needed),
     * - a deployed reusable `Cloudflare.Access.Policy`
     *   (`policies: [allowTeam]`),
     * - a policy id (`string`),
     * - `{ id, precedence? }`, or
     * - the same with per-application overrides (`approvalRequired`,
     *   `isolationRequired`, `purposeJustificationRequired`,
     *   `purposeJustificationPrompt`, `sessionDuration`, `approvalGroups`).
     *
     * Cloudflare treats inline and reusable policies as mutually exclusive on
     * one application — mixing the two forms fails validation.
     *
     * @example
     * ```ts
     * policies: [
     *   { decision: "allow", include: [{ emailDomain: "example.com" }] },
     * ]
     * ```
     */
    policies?: ReadonlyArray<string | {
        policyId: string;
    } | InlineApplicationPolicy | {
        id: string;
        precedence?: number;
    } | {
        id: string;
        precedence?: number;
        approvalRequired?: boolean;
        isolationRequired?: boolean;
        purposeJustificationRequired?: boolean;
        purposeJustificationPrompt?: string;
        sessionDuration?: string;
        approvalGroups?: ReadonlyArray<{
            approvalsNeeded: number;
            emailAddresses?: ReadonlyArray<string>;
            emailListUuid?: string;
        }>;
    }>;
    /**
     * Adopt an existing app that already lives in Cloudflare (matched by
     * applicationId observation) instead of failing on conflict.
     *
     * @default false
     */
    adopt?: boolean;
}
/**
 * Output attributes persisted between reconciles.
 */
export interface ApplicationAttributes {
    /** Cloudflare-assigned application UUID. */
    applicationId: string;
    /** Audience tag used to verify JWTs issued for this application. */
    aud: string;
    /** Resolved domain. Cloudflare fills this in for `warp`/`saas` apps. */
    domain: string;
    /** Resolved destinations (echoed back by Cloudflare). */
    destinations: ReadonlyArray<ApplicationDestination> | undefined;
    /** Resolved managed OAuth configuration. */
    oauthConfiguration: OAuthConfiguration | undefined;
    /** Application type. */
    type: ApplicationType;
    /** Display name (resolved). */
    name: string;
    /** Account that owns this application. */
    accountId: string;
    /** ISO8601 creation timestamp (Cloudflare-supplied). */
    createdAt: string | undefined;
    /** ISO8601 last-update timestamp (Cloudflare-supplied). */
    updatedAt: string | undefined;
}
/**
 * Data other resources attach to an Access application via bindings.
 * Workers enrolling themselves (the `access` prop on `Cloudflare.Worker`)
 * push their `worker`/`preview_worker` destinations here; the application
 * deploys with — and converges on — the union of its own `destinations`
 * prop and every bound contribution.
 */
export interface ApplicationBinding {
    destinations?: ApplicationDestination[];
}
export declare const isApplication: <T>(value: T) => value is T & Application;
export type Application = Resource<"Cloudflare.Access.Application", ApplicationProps, ApplicationAttributes, ApplicationBinding, Providers>;
/**
 * A Cloudflare Zero Trust Access application.
 *
 * Replaces the curl-based `POST /accounts/{accountId}/access/apps` workflow
 * with an Alchemy-managed resource. Supports every Cloudflare application
 * type including `warp`, which Cloudflare requires for device enrolment via
 * the WARP client.
 *
 * Access policies are authored as standalone {@link Policy} resources
 * and referenced here by id — there is no inline-policy support.
 * ### Creating an Application
 * **Example:** Self-hosted application gated by a reusable Access policy
 * ```typescript
 * const allowMyOrg = yield* Cloudflare.Access.Policy("AllowMyOrg", {
 *   name: "Allow example.com via Google",
 *   decision: "allow",
 *   include: [{ emailDomain: { domain: "example.com" } }],
 * });
 *
 * const app = yield* Cloudflare.Access.Application("InternalDashboard", {
 *   type: "self_hosted",
 *   domain: "dashboard.example.com",
 *   sessionDuration: "24h",
 *   policies: [allowMyOrg],
 * });
 * ```
 *
 * **Example:** Managed OAuth for an MCP server
 * ```typescript
 * const app = yield* Cloudflare.Access.Application("McpServer", {
 *   type: "self_hosted",
 *   domain: "mcp.example.com",
 *   oauthConfiguration: {
 *     enabled: true,
 *     grant: {
 *       sessionDuration: "24h",
 *       accessTokenLifetime: "15m",
 *     },
 *     dynamicClientRegistration: {
 *       enabled: true,
 *       allowAnyOnLocalhost: true,
 *       allowAnyOnLoopback: true,
 *     },
 *   },
 * });
 * ```
 *
 * ### Protecting Cloudflare Workers
 * **Example:** Require Access on a specific Worker
 * ```typescript
 * // The application owns the policies (inline here — no separate Policy
 * // resource needed); the Worker enrolls itself via its `access` prop,
 * // covering its custom domains, routes, workers.dev URL, and version
 * // preview URLs.
 * const App = Cloudflare.Access.Application("TeamOnly", {
 *   type: "self_hosted",
 *   policies: [
 *     { decision: "allow", include: [{ emailDomain: "example.com" }] },
 *   ],
 * });
 *
 * export default class Api extends Cloudflare.Worker<Api>()("Api", {
 *   main: import.meta.url,
 *   access: { application: App },
 * }, /* ... *​/) {}
 * ```
 *
 * **Example:** Require Access on every Worker in the account
 * ```typescript
 * // Covers all current AND future Workers. Hostname-level policies beat
 * // Worker-level policies, which beat this account-level policy — so an
 * // individual Worker can still be opened up with its own application.
 * yield* Cloudflare.Access.Application("ProtectAllWorkers", {
 *   type: "self_hosted",
 *   destinations: [
 *     Cloudflare.Access.AllWorkers,         // production traffic of every Worker
 *     Cloudflare.Access.AllWorkerPreviews,  // every Worker's preview URLs
 *   ],
 *   policies: [
 *     { decision: "allow", include: [{ emailDomain: "example.com" }] },
 *   ],
 * });
 * ```
 *
 * ### Device-enrollment (warp)
 * **Example:** WARP device-enrollment application
 * ```typescript
 * // There can only be ONE warp app per account; Cloudflare auto-derives the
 * // domain (`${authDomain}/warp`) so do not pass `domain` for this type.
 * const allowCorp = yield* Cloudflare.Access.Policy("AllowCorpUsers", {
 *   name: "Allow corp users",
 *   decision: "allow",
 *   include: [{ emailDomain: { domain: "example.com" } }],
 * });
 *
 * const enroll = yield* Cloudflare.Access.Application("warp-login", {
 *   type: "warp",
 *   allowedIdps: [googleIdpId],
 *   autoRedirectToIdentity: true,
 *   sessionDuration: "720h",
 *   policies: [allowCorp],
 * });
 * ```
 *
 * ### Self-hosted with Google IdP
 * **Example:** Self-hosted application restricted to a Google Workspace group
 * ```typescript
 * const admins = yield* Cloudflare.Access.Policy("AdminsOnly", {
 *   name: "Admins only",
 *   decision: "allow",
 *   include: [
 *     {
 *       gsuite: {
 *         email: "admins@example.com",
 *         identityProviderId: googleIdpUuid,
 *       },
 *     },
 *   ],
 * });
 *
 * const app = yield* Cloudflare.Access.Application("AdminConsole", {
 *   type: "self_hosted",
 *   domain: "admin.example.com",
 *   allowedIdps: [googleIdpUuid],
 *   autoRedirectToIdentity: true,
 *   policies: [admins],
 * });
 * ```
 *
 * @resource
 * @product Access
 * @category Cloudflare One (Zero Trust)
 */
export declare const Application: import("../../Resource.ts").ResourceClass<Application>;
export declare const ApplicationProvider: () => import("effect/Layer").Layer<Provider.Provider<Application>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | zeroTrust.CloudflareOpContext>;
//# sourceMappingURL=Application.d.ts.map