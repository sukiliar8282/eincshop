import * as Namespace from "../../Namespace.js";
import { makeFrameworkSite } from "./FrameworkSite.js";
/** The framework-integration package that drives the SvelteKit build. */
export const SVELTEKIT_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/sveltekit";
/** The Node container deploy target for the SvelteKit build. */
export const SVELTEKIT_NODE_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/sveltekit/node";
/**
 * Deploy a SvelteKit application to a Hetzner Cloud Server: kit's SSR
 * server as a systemd unit on port 3000, static assets (prerendered
 * pages included) baked into the unit.
 *
 * The build runs through `@alchemy.run/frontend-frameworks/sveltekit` with
 * the `@alchemy.run/frontend-frameworks/sveltekit/node` deploy target.
 *
 *
 * ### Creating SvelteKit Sites
 * **Example:** Basic SvelteKit App
 * ```typescript
 * const site = yield* Hetzner.Website.SvelteKit("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * **Example:** Custom Domain
 * ```typescript
 * const site = yield* Hetzner.Website.SvelteKit("Web", {
 *   rootDir: "./app",
 *   domain: "app.example.com",
 *   zone,
 * });
 * ```
 *
 * @resource
 * @product Website
 */
export const SvelteKit = (id, props = {}) => makeFrameworkSite(id, props, {
    name: "SvelteKit",
    framework: SVELTEKIT_FRAMEWORK_SPECIFIER,
    target: SVELTEKIT_NODE_TARGET_SPECIFIER,
    options: props.kit ? { kit: props.kit } : undefined,
}).pipe(Namespace.push(id));
//# sourceMappingURL=SvelteKit.js.map