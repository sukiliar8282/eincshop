import * as Namespace from "../../Namespace.js";
import { makeFrameworkSite, staticConfigFromAssets, } from "./FrameworkSite.js";
/** The framework-integration package that drives the Astro build. */
export const ASTRO_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/astro";
/** The Node container deploy target for the Astro build. */
export const ASTRO_NODE_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/astro/node";
/**
 * Deploy an [Astro](https://astro.build) application to Railway: the Node
 * SSR bundle (assets first, then the Astro fetch handler) on one
 * `Railway.Service`. Pages render on demand by default
 * (`output: "server"`); pages that `export const prerender = true` are
 * prerendered at build time and served as static files. With
 * `astro: { output: "static" }` every page is prerendered and the deploy
 * is assets-only.
 *
 * The build runs through `@alchemy.run/frontend-frameworks/astro` with the
 * `@alchemy.run/frontend-frameworks/astro/node` deploy target (a Node
 * adapter is injected — your `astro.config.*` must not declare one).
 *
 * During `alchemy dev` the site is Astro's own dev server and no cloud
 * resources are created. `Alchemy.remote()` opts back into the live
 * Service path.
 *
 * ### Creating Astro Sites
 * **Example:** Basic Astro App
 * ```typescript
 * const site = yield* Railway.Website.Astro("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * ### Static Sites
 * **Example:** Fully Static Astro Site
 * ```typescript
 * const site = yield* Railway.Website.Astro("Docs", {
 *   rootDir: "./docs",
 *   astro: { output: "static" },
 *   errorPage: "404.html",
 * });
 * ```
 *
 * ### Server Configuration
 * **Example:** Process Environment
 * ```typescript
 * const site = yield* Railway.Website.Astro("Web", {
 *   rootDir: "./app",
 *   env: {
 *     API_BASE: "https://api.example.com",
 *   },
 * });
 * ```
 *
 * @resource
 * @product Website
 */
export const Astro = (id, props = {}) => {
    const output = props.astro?.output ?? "server";
    return makeFrameworkSite(id, props, {
        name: "Astro",
        framework: ASTRO_FRAMEWORK_SPECIFIER,
        target: ASTRO_NODE_TARGET_SPECIFIER,
        options: { astro: { ...props.astro, output } },
        static: output === "static" ? staticConfigFromAssets(props.assets) : undefined,
    }).pipe(Namespace.push(id));
};
//# sourceMappingURL=Astro.js.map