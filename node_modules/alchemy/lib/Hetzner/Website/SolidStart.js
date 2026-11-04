import * as Namespace from "../../Namespace.js";
import { makeFrameworkSite } from "./FrameworkSite.js";
/** The framework-integration package that drives the SolidStart build. */
export const SOLIDSTART_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/solidstart";
/** The Node container deploy target for the SolidStart build. */
export const SOLIDSTART_NODE_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/solidstart/node";
/**
 * Deploy a [SolidStart](https://start.solidjs.com) application to a
 * Hetzner Cloud Server: the SSR server as a systemd unit on port 3000,
 * static assets (prerendered pages included) baked into the unit.
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
 * const site = yield* Hetzner.Website.SolidStart("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * **Example:** Custom Domain
 * ```typescript
 * const site = yield* Hetzner.Website.SolidStart("Web", {
 *   rootDir: "./app",
 *   domain: "app.example.com",
 *   zone,
 * });
 * ```
 *
 * ### Server Configuration
 * **Example:** Process Environment
 * ```typescript
 * const site = yield* Hetzner.Website.SolidStart("Web", {
 *   rootDir: "./app",
 *   env: {
 *     API_BASE: "https://api.example.com",
 *   },
 * });
 * ```
 *
 * ### Prerendering
 * The integration owns the nitro plugin instance (a `nitroV2Plugin()` in
 * your `vite.config.*` is rejected), so nitro options — prerendering
 * included — go on the `nitro` prop. Prerendered pages are baked into the
 * unit and served as static assets.
 *
 * **Example:** Prerender Routes
 * ```typescript
 * const site = yield* Hetzner.Website.SolidStart("Web", {
 *   rootDir: "./app",
 *   nitro: { prerender: { routes: ["/", "/about"] } },
 * });
 * ```
 *
 * @resource
 * @product Website
 */
export const SolidStart = (id, props = {}) => makeFrameworkSite(id, props, {
    name: "SolidStart",
    framework: SOLIDSTART_FRAMEWORK_SPECIFIER,
    target: SOLIDSTART_NODE_TARGET_SPECIFIER,
    options: { nitro: props.nitro },
}).pipe(Namespace.push(id));
//# sourceMappingURL=SolidStart.js.map