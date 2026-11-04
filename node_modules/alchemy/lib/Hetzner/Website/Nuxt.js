import * as Namespace from "../../Namespace.js";
import { makeFrameworkSite } from "./FrameworkSite.js";
/** The framework-integration package that drives the Nuxt build. */
export const NUXT_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/nuxt";
/** The Node container deploy target for the Nuxt build. */
export const NUXT_NODE_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/nuxt/node";
/**
 * Deploy a Nuxt application to a Hetzner Cloud Server: the nitro Node
 * server as a systemd unit on port 3000, static assets baked into the
 * unit.
 *
 * The build runs through `@alchemy.run/frontend-frameworks/nuxt` with the
 * `@alchemy.run/frontend-frameworks/nuxt/node` deploy target (`nitro.preset`
 * `"node"`).
 *
 *
 * ### Creating Nuxt Sites
 * **Example:** Basic Nuxt App
 * ```typescript
 * const site = yield* Hetzner.Website.Nuxt("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * **Example:** Custom Domain
 * ```typescript
 * const site = yield* Hetzner.Website.Nuxt("Web", {
 *   rootDir: "./app",
 *   domain: "app.example.com",
 *   zone,
 * });
 * ```
 *
 * @resource
 * @product Website
 */
export const Nuxt = (id, props = {}) => makeFrameworkSite(id, props, {
    name: "Nuxt",
    framework: NUXT_FRAMEWORK_SPECIFIER,
    target: NUXT_NODE_TARGET_SPECIFIER,
    options: props.nuxt ? { nuxt: props.nuxt } : undefined,
}).pipe(Namespace.push(id));
//# sourceMappingURL=Nuxt.js.map