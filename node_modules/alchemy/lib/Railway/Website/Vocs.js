import * as Namespace from "../../Namespace.js";
import { makeFrameworkSite } from "./FrameworkSite.js";
/** The framework-integration package that drives the Vocs build. */
export const VOCS_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/vocs/node";
/** The Node container deploy target for the Vocs build. */
export const VOCS_NODE_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/vocs/node";
/**
 * Deploy a [Vocs](https://vocs.dev) documentation project to Railway: static
 * assets first, then Vocs' Waku RSC handler (`/about` not `/about/`) from
 * one `Railway.Service`.
 *
 * Requires `@alchemy.run/frontend-frameworks`, `vocs`, and Vocs' Waku peer
 * dependencies in the project.
 *
 * During `alchemy dev` the site is Vocs' own dev server and no cloud
 * resources are created. `Alchemy.remote()` opts back into the live
 * Service path.
 *
 * ### Deploying a Vocs Site
 * **Example:** Vocs documentation site
 * ```typescript
 * const docs = yield* Railway.Website.Vocs("Docs", {
 *   rootDir: "./docs",
 * });
 * ```
 *
 * ### Custom Build Output
 * **Example:** Custom output directory
 * ```typescript
 * // vocs.config.ts: defineConfig({ outDir: "build" })
 * const docs = yield* Railway.Website.Vocs("Docs", {
 *   rootDir: "./docs",
 *   outDir: "build",
 * });
 * ```
 *
 * @resource
 * @product Website
 */
export const Vocs = (id, props = {}) => makeFrameworkSite(id, props, {
    name: "Vocs",
    framework: VOCS_FRAMEWORK_SPECIFIER,
    target: VOCS_NODE_TARGET_SPECIFIER,
    options: props.outDir !== undefined ? { outDir: props.outDir } : undefined,
}).pipe(Namespace.push(id));
//# sourceMappingURL=Vocs.js.map