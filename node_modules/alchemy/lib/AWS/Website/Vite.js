import * as Namespace from "../../Namespace.js";
import { makeFrameworkSite } from "./FrameworkSite.js";
/** The framework-integration package that drives the Vite build. */
export const VITE_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/vite";
/** The AWS deploy target for the Vite build. */
export const VITE_AWS_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/vite/aws";
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
export const viteFrameworkOptions = (p) => p.vite !== undefined || p.config !== undefined
    ? {
        vite: {
            ...p.vite,
            ...(p.config !== undefined ? { configFile: p.config } : undefined),
        },
    }
    : undefined;
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
export const Vite = (id, props = {}) => {
    const p = props;
    return makeFrameworkSite(id, props, {
        name: "Vite",
        framework: VITE_FRAMEWORK_SPECIFIER,
        target: VITE_AWS_TARGET_SPECIFIER,
        options: viteFrameworkOptions(p),
        // Plain Vite is assets-only: every page is client-rendered from the
        // uploaded bundle, so the deploy never creates a server function.
        // `spa` defaults on (Vite apps are typically SPAs) but yields to an
        // explicit `errorPage` — the two are mutually exclusive downstream.
        static: {
            spa: p.spa ?? (p.errorPage === undefined ? true : undefined),
            errorPage: p.errorPage,
        },
    }).pipe(Namespace.push(id));
};
//# sourceMappingURL=Vite.js.map