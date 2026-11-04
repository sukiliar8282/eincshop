import { Vite } from "./Vite.js";
/**
 * Deploy a [Foldkit](https://foldkit.dev) app to a Hetzner Cloud Server.
 *
 * Foldkit apps are client-only Vite projects, so this composite is the
 * Vite site with SPA fallback to `index.html` (deep links boot the app
 * and the Foldkit router takes over).
 *
 *
 * ### Creating Foldkit Sites
 * **Example:** Foldkit App
 * ```typescript
 * const site = yield* Hetzner.Website.Foldkit("Website");
 * ```
 *
 * **Example:** Project in a Subdirectory
 * ```typescript
 * const site = yield* Hetzner.Website.Foldkit("Website", {
 *   rootDir: "applications/web",
 * });
 * ```
 *
 * ### Single-Page Application Routing
 * **Example:** Serving a real 404 page
 * ```typescript
 * const site = yield* Hetzner.Website.Foldkit("Website", {
 *   assets: { notFoundHandling: "404-page" },
 * });
 * ```
 *
 * @resource
 * @product Website
 */
export const Foldkit = (id, props = {}) => Vite(id, {
    ...props,
    assets: {
        notFoundHandling: "single-page-application",
        ...props.assets,
    },
});
//# sourceMappingURL=Foldkit.js.map