import { frameworkSite } from "./FrameworkSite.js";
/** The framework-integration package that drives the Octane build. */
export const OCTANE_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/octane";
/** The Node container deploy target for the Octane build. */
export const OCTANE_NODE_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/octane/node";
/**
 * Deploy an [OctaneJS](https://octanejs.dev) application to Fly: Octane's
 * SSR server on a Machine, static assets baked into the image.
 *
 * The project's `octane.config.ts` must select the Node marker adapter:
 *
 * ```ts
 * import { node } from "@alchemy.run/frontend-frameworks/octane/node-adapter";
 * import { defineConfig } from "@octanejs/vite-plugin";
 *
 * export default defineConfig({
 *   adapter: node(),
 *   // ...
 * });
 * ```
 *
 *
 * ### Creating Octane Sites
 * **Example:** Basic Octane App
 * ```typescript
 * const site = yield* Fly.Website.Octane("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * **Example:** Custom Domain
 * ```typescript
 * const site = yield* Fly.Website.Octane("Web", {
 *   rootDir: "./app",
 *   domain: "app.example.com",
 * });
 * ```
 *
 * @resource
 * @product Website
 */
export const Octane = (id, props = {}) => frameworkSite(id, props, {
    name: "Octane",
    framework: OCTANE_FRAMEWORK_SPECIFIER,
    target: OCTANE_NODE_TARGET_SPECIFIER,
});
//# sourceMappingURL=Octane.js.map