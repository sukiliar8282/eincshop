import { type FrameworkSiteProps } from "./FrameworkSite.ts";
/** The framework-integration package that drives the Vite build. */
export declare const VITE_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/vite";
/** The Node container deploy target for the Vite build. */
export declare const VITE_NODE_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/vite/node";
export interface ViteProps extends FrameworkSiteProps {
    /**
     * Serializable Vite config merged OVER the project's own `vite.config.*`.
     */
    vite?: {
        outDir?: string;
        base?: string;
    };
}
/**
 * Deploy a plain [Vite](https://vite.dev) application to Railway: static
 * assets (the `vite build` output) served by a generated Node static-file
 * server on one `Railway.Service`. For client-only projects — React/Vue/Solid
 * SPAs, `index.html` multi-page apps — whose entire deployable output is
 * static assets.
 *
 * The build runs through `@alchemy.run/frontend-frameworks/vite` with the
 * `@alchemy.run/frontend-frameworks/vite/node` deploy target — the package
 * must be installed in your project. Your project's own `vite.config.*`
 * (plugins included) drives the build.
 *
 * During `alchemy dev` the site is Vite's own dev server (native HMR) and
 * no cloud resources are created — the site's `url` is the dev server's
 * local address. `Alchemy.remote()` opts back into the full deployment.
 *
 * SSR frameworks that wrap Vite deploy through their own composites
 * ({@link Astro | Railway.Website.Astro}, {@link SvelteKit | Railway.Website.SvelteKit},
 * {@link Octane | Railway.Website.Octane}, ...) — this composite never
 * creates a framework server module.
 *
 * ### Creating Vite Sites
 * **Example:** Basic Vite SPA
 * ```typescript
 * const site = yield* Railway.Website.Vite("Web");
 * ```
 *
 * **Example:** Project in a Subdirectory
 * ```typescript
 * const site = yield* Railway.Website.Vite("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * **Example:** Existing Project
 * ```typescript
 * const project = yield* Railway.Project("Site");
 * const site = yield* Railway.Website.Vite("Web", {
 *   project,
 * });
 * ```
 *
 * ### Multi-Page Sites
 * **Example:** Per-Route HTML Pages with a 404 Page
 * ```typescript
 * const site = yield* Railway.Website.Vite("Docs", {
 *   assets: { notFoundHandling: "404-page" },
 * });
 * ```
 *
 * ### Build Configuration
 * **Example:** Custom Output Directory and Base Path
 * ```typescript
 * const site = yield* Railway.Website.Vite("Docs", {
 *   vite: { outDir: "build", base: "/docs/" },
 * });
 * ```
 *
 * ### Local Development
 * **Example:** Vite Dev Server Under `alchemy dev`
 * ```typescript
 * // `alchemy dev` starts `vite` programmatically: site.url is the local
 * // dev server (HMR included); no Project or Service is created.
 * const site = yield* Railway.Website.Vite("Web");
 * ```
 *
 * @resource
 * @product Website
 */
export declare const Vite: (id: string, props?: ViteProps) => import("effect/Effect").Effect<{
    url: import("../../Output.ts").Output<string | undefined, never>;
    service: undefined;
    project: undefined;
} | {
    url: string;
    service: import("../Service.ts").Service;
    project: import("../Project.ts").Project;
} | {
    url: import("../../Output.ts").Output<string | undefined, never>;
    service: import("../Service.ts").Service;
    project: import("../Project.ts").Project;
}, never, import("../../AlchemyContext.ts").AlchemyContext | import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("../../Provider.ts").Provider<import("../../Website/Server.ts").Server> | import("../Providers.ts").Providers>;
//# sourceMappingURL=Vite.d.ts.map