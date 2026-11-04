import { frameworkSite } from "./FrameworkSite.js";
/** The framework-integration package that drives the SvelteKit build. */
export const SVELTEKIT_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/sveltekit";
/** The Node container deploy target for the SvelteKit build. */
export const SVELTEKIT_NODE_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/sveltekit/node";
/**
 * Deploy a SvelteKit application to Fly: kit's SSR server on a Machine,
 * static assets baked into the image, served assets-first then the
 * framework handler.
 *
 *
 * ### Creating SvelteKit Sites
 * **Example:** Basic SvelteKit App
 * ```typescript
 * const site = yield* Fly.Website.SvelteKit("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * **Example:** Custom Domain
 * ```typescript
 * const site = yield* Fly.Website.SvelteKit("Web", {
 *   rootDir: "./app",
 *   domain: "app.example.com",
 * });
 * ```
 *
 * @resource
 * @product Website
 */
export const SvelteKit = (id, props = {}) => frameworkSite(id, props, {
    name: "SvelteKit",
    framework: SVELTEKIT_FRAMEWORK_SPECIFIER,
    target: SVELTEKIT_NODE_TARGET_SPECIFIER,
    options: props.kit ? { kit: props.kit } : undefined,
});
//# sourceMappingURL=SvelteKit.js.map