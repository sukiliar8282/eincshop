import type { InputProps } from "../../Input.ts";
import { type FrameworkSiteProps } from "./FrameworkSite.ts";
/** The framework-integration package that drives the Vite build. */
export declare const VITE_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/vite";
/** The AWS deploy target for the Vite build. */
export declare const VITE_AWS_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/vite/aws";
/**
 * Serializable Vite build overrides merged OVER the project's own
 * `vite.config.*` at deploy time (deploy-time values win). Mirrors the
 * integration seam's `ViteBuildConfig`
 * (`@alchemy.run/frontend-frameworks/vite`). Deliberately a small,
 * JSON-serializable subset — plugins and other non-serializable config
 * belong in the config file, which loads natively.
 */
export interface ViteBuildConfig {
    /**
     * Public base path the site deploys under (vite's `base`). Overrides
     * the config file's `base` for both the production build and the dev
     * server under `alchemy dev`.
     */
    base?: string;
    /**
     * Build output directory, relative to `rootDir` (vite's
     * `build.outDir`). Overrides the config file's `build.outDir`.
     * @default the config file's `build.outDir` (vite's default: "dist")
     */
    outDir?: string;
}
export interface ViteProps extends Omit<FrameworkSiteProps, "env" | "memorySize" | "timeout" | "architecture" | "runtime"> {
    /**
     * Deploy-time Vite overrides merged over your `vite.config.*`. The
     * config file is the primary home for Vite configuration (it loads
     * natively, plugins included) — reach for this bag when a value is
     * decided by the deployment rather than the project, since config
     * files cannot consume alchemy `Output`s.
     */
    vite?: ViteBuildConfig;
    /**
     * Alternate Vite config file to load instead of the auto-discovered
     * `vite.config.*`, relative to {@link FrameworkSiteProps.rootDir | rootDir}.
     */
    config?: string;
    /**
     * Answer misses with the index page (200) instead of a 404, so
     * client-side routes deep-link correctly. Plain Vite apps are typically
     * single-page applications, so this defaults on; set `false` for
     * multi-page (`index.html`-per-route) projects. Mutually exclusive with
     * {@link errorPage}.
     * @default true unless `errorPage` is set
     */
    spa?: boolean;
    /**
     * Serve the built error page (e.g. `404.html`) with a real `404` status
     * for requests that match no uploaded file. Mutually exclusive with
     * {@link spa}.
     */
    errorPage?: string;
}
/**
 * Assemble the framework-integration `options` bag from the resource's
 * `vite` overrides and `config` file selection. The integration seam is
 * `ViteOptions.vite` (`@alchemy.run/frontend-frameworks/vite`), whose
 * `configFile` is resolved relative to the project root. Shared with
 * {@link Foldkit | AWS.Website.Foldkit}, which builds through the same
 * pipeline.
 *
 * @internal
 */
export declare const viteFrameworkOptions: (p: Pick<ViteProps, "vite" | "config">) => Record<string, unknown> | undefined;
/**
 * Deploy a plain [Vite](https://vite.dev) application to AWS: static assets
 * (the `vite build` output) in S3 behind a CloudFront distribution. For
 * client-only projects — React/Vue/Solid SPAs, `index.html` multi-page
 * apps — whose entire deployable output is static assets.
 *
 * The build runs through `@alchemy.run/frontend-frameworks/vite` with the
 * `@alchemy.run/frontend-frameworks/vite/aws` deploy target — the package
 * must be installed in your project. Your project's own `vite.config.*`
 * (plugins included) drives the build; input files are content-hashed so
 * unchanged projects skip the build and deploy entirely.
 *
 * During `alchemy dev` the site is Vite's own dev server (native HMR) and
 * no cloud resources are created — the site's `url` is the dev server's
 * local address. `Alchemy.remote()` opts back into the full deployment.
 *
 * SSR frameworks that wrap Vite deploy through their own composites
 * ({@link Astro | AWS.Website.Astro}, {@link SvelteKit | AWS.Website.SvelteKit},
 * {@link Octane | AWS.Website.Octane}, ...) — this composite never creates
 * a server function.
 *
 * ### Creating Vite Sites
 * **Example:** Basic Vite SPA
 * ```typescript
 * const site = yield* AWS.Website.Vite("Web");
 * ```
 *
 * **Example:** Project in a Subdirectory
 * ```typescript
 * const site = yield* AWS.Website.Vite("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * **Example:** Custom Domain
 * ```typescript
 * const site = yield* AWS.Website.Vite("Web", {
 *   domain: {
 *     name: "app.example.com",
 *     hostedZoneId: zone.hostedZoneId,
 *   },
 * });
 * ```
 *
 * ### Multi-Page Sites
 * **Example:** Per-Route HTML Pages with a 404 Page
 * ```typescript
 * const site = yield* AWS.Website.Vite("Docs", {
 *   spa: false,
 *   errorPage: "404.html",
 * });
 * ```
 *
 * ### Sharing a Router
 * **Example:** Serve Through an Existing AWS.Website.Router
 * ```typescript
 * const router = yield* AWS.Website.Router("Router", {});
 * const site = yield* AWS.Website.Vite("Web", {
 *   domain: { router },
 * });
 * ```
 *
 * ### Build Configuration
 * Vite configuration lives in your project's own `vite.config.*`, which
 * loads natively — plugins included. The `vite` bag is for deploy-time
 * overrides merged over that file (config files cannot consume alchemy
 * `Output`s), and `config` selects an alternate config file.
 *
 * **Example:** Deploy-Time Base Path Override
 * ```typescript
 * const site = yield* AWS.Website.Vite("Docs", {
 *   vite: { base: "/docs/" },
 * });
 * ```
 *
 * **Example:** Alternate Config File
 * ```typescript
 * const site = yield* AWS.Website.Vite("Web", {
 *   config: "vite.deploy.config.ts",
 * });
 * ```
 *
 * ### Local Development
 * **Example:** Vite Dev Server Under `alchemy dev`
 * ```typescript
 * // `alchemy dev` starts `vite` programmatically: site.url is the local
 * // dev server (HMR included); no bucket or distribution is created.
 * const site = yield* AWS.Website.Vite("Web");
 * ```
 *
 * @resource
 */
export declare const Vite: (id: string, props?: InputProps<ViteProps>) => import("effect/Effect").Effect<{
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
//# sourceMappingURL=Vite.d.ts.map