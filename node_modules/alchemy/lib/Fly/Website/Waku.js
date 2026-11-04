import { frameworkSite } from "./FrameworkSite.js";
/** The framework-integration package that drives the Waku build. */
export const WAKU_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/waku";
/** The Node container deploy target for the Waku build. */
export const WAKU_NODE_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/waku/node";
const wakuOptions = (props) => props.waku !== undefined ? { waku: props.waku } : undefined;
/**
 * Deploy a [Waku](https://waku.gg) application to Fly: the RSC server on a
 * Machine, static assets (SSG pages included) baked into the image.
 * Prerendered pages are served extensionless (`/about`).
 *
 *
 * ### Creating Waku Sites
 * **Example:** Basic Waku App
 * ```typescript
 * const site = yield* Fly.Website.Waku("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * **Example:** Custom Domain
 * ```typescript
 * const site = yield* Fly.Website.Waku("Web", {
 *   rootDir: "./app",
 *   domain: "app.example.com",
 * });
 * ```
 *
 * @resource
 * @product Website
 */
export const Waku = (id, props = {}) => frameworkSite(id, props, {
    name: "Waku",
    framework: WAKU_FRAMEWORK_SPECIFIER,
    target: WAKU_NODE_TARGET_SPECIFIER,
    options: wakuOptions(props),
    htmlHandling: "drop-trailing-slash",
});
//# sourceMappingURL=Waku.js.map