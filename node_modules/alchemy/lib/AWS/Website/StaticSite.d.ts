import * as Effect from "effect/Effect";
import type * as Redacted from "effect/Redacted";
import { AlchemyContext } from "../../AlchemyContext.ts";
import * as Command from "../../Command/index.ts";
import type { Input } from "../../Input.ts";
import * as Output from "../../Output.ts";
import { Stack } from "../../Stack.ts";
import { Stage } from "../../Stage.ts";
import { Distribution } from "../CloudFront/Distribution.ts";
import { Invalidation } from "../CloudFront/Invalidation.ts";
import { Bucket } from "../S3/Bucket.ts";
import { AssetDeployment } from "./AssetDeployment.ts";
import { type StaticSiteBuildProps, type WebsiteAssetsConfig, type WebsiteDomainProps, type WebsiteEdgeProps, type WebsiteInvalidationProps } from "./shared.ts";
export interface StaticSiteProps {
    /**
     * Path to the local site directory.
     * @default "."
     */
    path?: Input<string>;
    /**
     * Optional build configuration executed before upload.
     */
    build?: StaticSiteBuildProps;
    /**
     * Static site asset upload configuration.
     */
    assets?: WebsiteAssetsConfig;
    /**
     * Optional custom domain. A string is shorthand for `{ name }`; `null`
     * explicitly clears a previously set domain. Set `domain.router` to
     * serve the site through an existing `AWS.Website.Router` instead of a
     * standalone CloudFront distribution.
     */
    domain?: string | WebsiteDomainProps | null;
    /**
     * Serve the site at its CloudFront default domain
     * (`https://dxxxx.cloudfront.net`). The default domain cannot be removed
     * from a distribution, so `false` is emulated at the edge: the generated
     * viewer-request CloudFront Function 301s requests that arrive on the
     * default domain to `https://<domain.name>` (path and query preserved),
     * and the default domain is excluded from the `urls` output.
     *
     * Requires `domain` when `false` (the site would be unreachable). Not
     * applicable to Router-attached sites (`domain.router`) — they own no
     * distribution.
     * @default true
     */
    cloudfrontUrl?: boolean;
    /**
     * Additional CloudFront Function customizations.
     */
    edge?: WebsiteEdgeProps;
    /**
     * Index page served for the site root.
     * @default "index.html"
     */
    indexPage?: string;
    /**
     * Serve this site as a single-page application: any request that does not
     * match an uploaded file is answered with the `indexPage` and a `200`
     * status so client-side routing can take over.
     *
     * This is also the fallback behavior when neither `spa` nor `errorPage`
     * is set. Setting `spa: true` makes the intent explicit and guards
     * against accidentally combining it with `errorPage`.
     *
     * Mutually exclusive with `errorPage` (a static site returns a real
     * `404`; a SPA serves the app shell).
     * @default false
     */
    spa?: boolean;
    /**
     * Error page returned for 403/404 requests.
     * When set, CloudFront customErrorResponses are created and misses return
     * a real `404` status. Mutually exclusive with `spa`.
     */
    errorPage?: string;
    /**
     * Optional deterministic S3 bucket name for newly created buckets.
     */
    bucketName?: string;
    /**
     * Whether to delete uploaded objects before destroying created buckets.
     * @default false
     */
    forceDestroy?: boolean;
    /**
     * CloudFront invalidation behavior.
     * @default { paths: "all", wait: false }
     */
    invalidation?: false | WebsiteInvalidationProps;
    /**
     * User-defined tags applied to created resources.
     */
    tags?: Record<string, string>;
    /**
     * Local dev configuration. When `alchemy dev` runs, the build/upload is
     * skipped and `command` is spawned as a long-lived child process tied to
     * the stack's scope. Alchemy does not proxy or interpret the process —
     * the dev server's own URL (e.g. `http://localhost:5173`) is what you
     * open in the browser.
     *
     * @example
     * ```typescript
     * AWS.Website.StaticSite("App", {
     *   path: "./app",
     *   build: { command: "npm run build", output: "dist" },
     *   dev: { command: "npm run dev" },
     * });
     * ```
     */
    dev?: {
        /**
         * Shell command to run as the local dev server (e.g. `npm run dev`).
         */
        command: string;
        /**
         * Working directory for {@link command}. Defaults to
         * {@link StaticSiteProps.path} (the site directory), or
         * `process.cwd()` if neither is set.
         */
        cwd?: string;
        /**
         * Environment variables for {@link command}, merged on top of
         * `process.env`. `Redacted` values stay out of logs and state, so put
         * secrets here rather than interpolating them into {@link command}.
         */
        env?: Record<string, string | Redacted.Redacted<string>>;
        /**
         * Override for the `url` output if alchemy fails to detect it from the
         * stdout of the dev command.
         */
        url?: string;
    };
}
/**
 * Deploy a static website to S3 and CloudFront using KV-based edge routing.
 *
 * `StaticSite` uploads site files to a private S3 bucket, creates a CloudFront
 * KeyValueStore with a file manifest for edge routing, and optionally builds
 * the site first. Supports standalone distribution or composition with
 * `AWS.Website.Router`.
 * ### Basic Sites
 * **Example:** Simple Static Site
 * ```typescript
 * const site = yield* StaticSite("Docs", {
 *   path: "./site",
 * });
 * ```
 *
 * ### Built Sites
 * **Example:** Build A Vite App
 * ```typescript
 * const site = yield* StaticSite("Web", {
 *   path: "./frontend",
 *   build: {
 *     command: "bun run build",
 *     output: "dist",
 *     env: {
 *       VITE_API_URL: api.url,
 *     },
 *   },
 * });
 * ```
 *
 * ### Single-Page Applications
 * **Example:** SPA With Client-Side Routing
 * ```typescript
 * // Misses fall back to index.html with a 200 so the client router
 * // can handle the path.
 * const site = yield* StaticSite("App", {
 *   path: "./app",
 *   build: {
 *     command: "bun run build",
 *     output: "dist",
 *   },
 *   spa: true,
 * });
 * ```
 *
 * ### Custom Domains
 * **Example:** Site With A Route 53 Domain
 * ```typescript
 * const site = yield* StaticSite("Web", {
 *   path: "./site",
 *   domain: {
 *     name: "www.example.com",
 *     hostedZoneId: zone.hostedZoneId,
 *   },
 *   errorPage: "404.html",
 * });
 * ```
 *
 * ### Router Composition
 * **Example:** Serve Through A Router
 * ```typescript
 * const site = yield* StaticSite("Docs", {
 *   path: "./docs",
 *   domain: {
 *     router,
 *     path: "/docs",
 *   },
 * });
 * ```
 *
 * **Example:** Host-Matched Router Attachment
 * ```typescript
 * // The site serves for docs.example.com on the router. On a same-stack
 * // router that owns a domain, this declaration alone provisions the
 * // hostname end-to-end: the site binds it onto the router's distribution
 * // (alias), certificate (SAN), and Route 53 record set. Wildcard
 * // patterns and cross-stack router refs register KV host-matching only —
 * // those hostnames must be covered by the router's own domain.
 * const site = yield* StaticSite("Docs", {
 *   path: "./docs",
 *   domain: {
 *     name: "docs.example.com",
 *     router,
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const StaticSite: (id: string, props: StaticSiteProps) => Effect.Effect<{
    bucket: undefined;
    build: undefined;
    files: undefined;
    distribution: undefined;
    invalidation: undefined;
    kvNamespace: string | undefined;
    url: Output.Output<string | undefined, never>;
    urls: Output.Output<string | undefined, never>[];
} | {
    bucket: Bucket;
    build: Command.Build | undefined;
    files: AssetDeployment;
    distribution: Distribution | undefined;
    invalidation: Invalidation | undefined;
    kvNamespace: string;
    /**
     * The most significant URL the site serves at — always `urls[0]`.
     */
    url: Input<string>;
    /**
     * Every URL that serves this site, most significant first —
     * `[https://<domain.name>?, ...aliases, <CloudFront default domain>?]`
     * (the default domain only while `cloudfrontUrl` is enabled).
     * Router-attached sites list their own hostnames (host-matched) or
     * the router's URL plus `domain.path` (path-only). Redirect
     * hostnames never appear — they serve no content.
     */
    urls: Input<string>[];
}, never, AlchemyContext | import("../../Provider.ts").Provider<Command.Build> | import("../../Provider.ts").Provider<Command.Dev> | import("../Providers.ts").Providers | Stack | Stage>;
/**
 * Dynamic server origin for {@link makeKvSite} — the KV metadata gains a
 * `servers` entry so requests that match no uploaded file are forwarded to
 * the server instead of a static fallback.
 * @internal
 */
export interface KvSiteServerOptions {
    /**
     * Hostname of the dynamic server origin (e.g. a Lambda Function URL
     * host). Requests that miss the file manifest are forwarded here with
     * `x-forwarded-host` set.
     */
    serverHost: Input<string>;
    /**
     * Optional dedicated image-optimization origin: requests whose path
     * starts with `route` (e.g. `/_next/image`) are forwarded to `host`
     * instead of the server origin (see `metadata.image` in cfcode.ts).
     */
    image?: {
        route: string;
        host: Input<string>;
    };
}
/**
 * Shared implementation behind `StaticSite` and the SSR framework
 * composites (`AWS.Website.Nuxt`, ...): S3 + CloudFront + KV-manifest edge
 * routing, optionally with a dynamic server origin for misses.
 * @internal
 */
export declare const makeKvSite: (id: string, props: StaticSiteProps, server?: KvSiteServerOptions | undefined) => Effect.Effect<{
    bucket: Bucket;
    build: Command.Build | undefined;
    files: AssetDeployment;
    distribution: Distribution | undefined;
    invalidation: Invalidation | undefined;
    kvNamespace: string;
    /**
     * The most significant URL the site serves at — always `urls[0]`.
     */
    url: Input<string>;
    /**
     * Every URL that serves this site, most significant first —
     * `[https://<domain.name>?, ...aliases, <CloudFront default domain>?]`
     * (the default domain only while `cloudfrontUrl` is enabled).
     * Router-attached sites list their own hostnames (host-matched) or
     * the router's URL plus `domain.path` (path-only). Redirect
     * hostnames never appear — they serve no content.
     */
    urls: Input<string>[];
}, never, import("../../Provider.ts").Provider<Command.Build> | import("../Providers.ts").Providers | Stack | Stage>;
//# sourceMappingURL=StaticSite.d.ts.map