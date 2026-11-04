import { frameworkSite } from "./FrameworkSite.js";
/** The framework-integration package that drives the SolidStart build. */
export const SOLIDSTART_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/solidstart";
/** The Node container deploy target for the SolidStart build. */
export const SOLIDSTART_NODE_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/solidstart/node";
/**
 * Deploy a [SolidStart](https://start.solidjs.com) application to Fly: the
 * SSR server on a Machine, static assets (prerendered pages included)
 * baked into the image, served assets-first then the framework handler.
 *
 * The build runs through `@alchemy.run/frontend-frameworks/solidstart` with
 * the `@alchemy.run/frontend-frameworks/solidstart/node` deploy target —
 * both must be installed in your project, alongside `@solidjs/start` and
 * `@solidjs/vite-plugin-nitro-2`.
 *
 * Your `vite.config.ts` needs no adapter wiring: the integration drives the
 * project's own `vite build` and appends its own nitro plugin instance
 * carrying nitro's `node` preset.
 *
 *
 * ### Creating SolidStart Sites
 * **Example:** Basic SolidStart App
 * ```typescript
 * const site = yield* Fly.Website.SolidStart("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * **Example:** Custom Domain
 * ```typescript
 * const site = yield* Fly.Website.SolidStart("Web", {
 *   rootDir: "./app",
 *   domain: "app.example.com",
 * });
 * ```
 *
 * ### Server Configuration
 * **Example:** Process Environment
 * ```typescript
 * const site = yield* Fly.Website.SolidStart("Web", {
 *   rootDir: "./app",
 *   env: {
 *     GREETING: "Hello from SolidStart on Fly!",
 *   },
 * });
 * ```
 *
 * ### Prerendering
 * The integration owns the nitro plugin instance (a `nitroV2Plugin()` in
 * your `vite.config.*` is rejected), so nitro options — prerendering
 * included — go on the `nitro` prop. Prerendered pages are baked into the
 * image and served as static files.
 *
 * **Example:** Prerender Routes
 * ```typescript
 * const site = yield* Fly.Website.SolidStart("Web", {
 *   rootDir: "./app",
 *   nitro: { prerender: { routes: ["/", "/about"] } },
 * });
 * ```
 *
 * @resource
 * @product Website
 */
export const SolidStart = (id, props = {}) => frameworkSite(id, props, {
    name: "SolidStart",
    framework: SOLIDSTART_FRAMEWORK_SPECIFIER,
    target: SOLIDSTART_NODE_TARGET_SPECIFIER,
    options: { nitro: props.nitro },
});
//# sourceMappingURL=SolidStart.js.map