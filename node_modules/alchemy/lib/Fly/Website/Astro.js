import { frameworkSite, staticConfigFromAssets, } from "./FrameworkSite.js";
/** The framework-integration package that drives the Astro build. */
export const ASTRO_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/astro";
/** The Node container deploy target for the Astro build. */
export const ASTRO_NODE_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/astro/node";
/**
 * Deploy an [Astro](https://astro.build) application to Fly: a Service
 * running the Node adapter's serve entry (static files first, then the
 * framework handler) on port 3000.
 *
 * Pages render on demand by default (`output: "server"`). With
 * `astro: { output: "static" }` every page is prerendered and the deploy
 * is assets-only.
 *
 *
 * ### Creating Astro Sites
 * **Example:** Basic Astro App
 * ```typescript
 * const site = yield* Fly.Website.Astro("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * **Example:** Custom Domain
 * ```typescript
 * const site = yield* Fly.Website.Astro("Web", {
 *   rootDir: "./app",
 *   domain: "app.example.com",
 * });
 * ```
 *
 * ### Static Sites
 * **Example:** Fully Static Astro Site
 * ```typescript
 * const site = yield* Fly.Website.Astro("Docs", {
 *   rootDir: "./docs",
 *   astro: { output: "static" },
 *   assets: { notFoundHandling: "404-page" },
 * });
 * ```
 *
 * @resource
 * @product Website
 */
export const Astro = (id, props = {}) => {
    const output = props.astro?.output ?? "server";
    return frameworkSite(id, props, {
        name: "Astro",
        framework: ASTRO_FRAMEWORK_SPECIFIER,
        target: ASTRO_NODE_TARGET_SPECIFIER,
        options: { astro: { ...props.astro, output } },
        static: output === "static" ? staticConfigFromAssets(props.assets) : undefined,
    });
};
//# sourceMappingURL=Astro.js.map