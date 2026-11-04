import type { InputProps } from "../../Input.ts";
import { type FrameworkSiteProps } from "./FrameworkSite.ts";
/** The framework-integration package that drives the Astro build. */
export declare const ASTRO_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/astro";
/** The AWS Lambda deploy target for the Astro build. */
export declare const ASTRO_AWS_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/astro/aws";
export interface AstroProps extends FrameworkSiteProps {
    /**
     * Deploy-time Astro config overrides, merged OVER your natively-loaded
     * `astro.config.*` (values here win). Use it for values that vary per
     * stage or derive from other resources' Outputs — everything else
     * belongs in the config file.
     */
    astro?: {
        /** Deployed URL origin (astro's `site`). */
        site?: string;
        /** Base path the site is served from (astro's `base`). */
        base?: string;
        /**
         * Astro output target — a deploy-topology decision (whether a
         * server function exists). `"server"` renders pages on demand in
         * the Lambda; individual pages opt into prerendering with
         * `export const prerender = true`. `"static"` prerenders every
         * page at build time and deploys assets-only (no Lambda).
         * Supersedes a file-level `output`.
         * @default "server"
         */
        output?: "server" | "static";
        /** Source directory (astro's `srcDir`). */
        srcDir?: string;
        /** Public assets directory (astro's `publicDir`). */
        publicDir?: string;
        /** Build output directory (astro's `outDir`). */
        outDir?: string;
        /** Trailing-slash handling (astro's `trailingSlash`). */
        trailingSlash?: "always" | "never" | "ignore";
    };
    /**
     * Path to an alternate astro config file, relative to `rootDir`.
     * Defaults to astro's own config discovery.
     */
    config?: string;
    /**
     * Serve the built error page (e.g. astro's `404.html`) for requests that
     * match no uploaded file. Only applies to `astro: { output: "static" }`
     * sites — a server-backed site forwards misses to the Lambda instead.
     */
    errorPage?: string;
    /**
     * Answer misses with the index page (200) instead of a 404. Only applies
     * to `astro: { output: "static" }` sites.
     */
    spa?: boolean;
}
/**
 * Deploy an [Astro](https://astro.build) application to AWS: the server
 * bundle on a streaming Lambda Function URL, static assets (prerendered
 * pages included) in S3, and a CloudFront distribution whose edge router
 * serves uploaded files from S3 and forwards everything else to the server.
 *
 * The build runs through `@alchemy.run/frontend-frameworks/astro` with the
 * `@alchemy.run/frontend-frameworks/astro/aws` deploy target (a wrangler-free
 * AWS Lambda adapter is injected — your `astro.config.*` must not declare
 * one) — the package must be installed in your project.
 *
 * Pages render on demand by default (`output: "server"`); pages that
 * `export const prerender = true` are prerendered at build time and served
 * from S3. With `astro: { output: "static" }` every page is prerendered
 * and the deploy is assets-only — no Lambda.
 *
 * Your `astro.config.*` is the home for Astro configuration and loads
 * natively; the `astro` prop is a deploy-time override bag merged OVER
 * the file for values that vary per stage or derive from other
 * resources' Outputs. `config` points at an alternate config file
 * (relative to `rootDir`).
 *
 * ### Creating Astro Sites
 * **Example:** Basic Astro App
 * ```typescript
 * const site = yield* AWS.Website.Astro("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * **Example:** Per-stage site URL override
 * ```typescript
 * const site = yield* AWS.Website.Astro("Blog", {
 *   rootDir: "./blog",
 *   astro: { site: "https://blog.example.com" },
 * });
 * ```
 *
 * **Example:** Custom Domain
 * ```typescript
 * const site = yield* AWS.Website.Astro("Web", {
 *   rootDir: "./app",
 *   domain: {
 *     name: "app.example.com",
 *     hostedZoneId: zone.hostedZoneId,
 *   },
 * });
 * ```
 *
 * ### Static Sites
 * **Example:** Fully Static Astro Site
 * ```typescript
 * const site = yield* AWS.Website.Astro("Docs", {
 *   rootDir: "./docs",
 *   astro: { output: "static" },
 *   errorPage: "404.html",
 * });
 * ```
 *
 * ### Server Configuration
 * **Example:** Tune The Server Function
 * ```typescript
 * const site = yield* AWS.Website.Astro("Web", {
 *   rootDir: "./app",
 *   memorySize: 2048,
 *   env: {
 *     API_BASE: api.url,
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Astro: (id: string, props?: InputProps<AstroProps>) => import("effect/Effect").Effect<{
    bucket: undefined;
    build: import("../../Website/Server.ts").Server;
    files: undefined;
    distribution: undefined;
    invalidation: undefined;
    kvNamespace: string | undefined;
    server: undefined;
    serverUrl: undefined;
    url: import("../../Output.ts").Output<string | undefined, never>;
    urls: import("../../Output.ts").Output<string | undefined, never>[];
} | {
    bucket: import("../S3/Bucket.ts").Bucket;
    files: import("./AssetDeployment.ts").AssetDeployment;
    distribution: import("../CloudFront/Distribution.ts").Distribution | undefined;
    invalidation: import("../CloudFront/Invalidation.ts").Invalidation | undefined;
    kvNamespace: string;
    url: import("../../Input.ts").Input<string>;
    urls: import("../../Input.ts").Input<string>[];
    build: import("../../Website/Server.ts").Server;
    server: undefined;
    serverUrl: undefined;
} | {
    bucket: import("../S3/Bucket.ts").Bucket;
    files: import("./AssetDeployment.ts").AssetDeployment;
    distribution: import("../CloudFront/Distribution.ts").Distribution | undefined;
    invalidation: import("../CloudFront/Invalidation.ts").Invalidation | undefined;
    kvNamespace: string;
    url: import("../../Input.ts").Input<string>;
    urls: import("../../Input.ts").Input<string>[];
    build: import("../../Website/Server.ts").Server;
    server: import("../Lambda/Function.ts").Function;
    serverUrl: import("../../Output.ts").Output<string | undefined, never>;
}, never, import("../../AlchemyContext.ts").AlchemyContext | import("../../Provider.ts").Provider<import("../../Command/Build.ts").Build> | import("../../Provider.ts").Provider<import("../../Website/Server.ts").Server> | import("../Providers.ts").Providers | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Astro.d.ts.map