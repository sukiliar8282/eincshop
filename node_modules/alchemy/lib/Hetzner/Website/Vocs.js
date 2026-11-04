import * as Namespace from "../../Namespace.js";
import { makeFrameworkSite } from "./FrameworkSite.js";
/** The framework-integration package that drives the Vocs build. */
export const VOCS_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/vocs/node";
/** The Node container deploy target for the Vocs build. */
export const VOCS_NODE_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/vocs/node";
/**
 * Deploy a [Vocs](https://vocs.dev) documentation project to a Hetzner
 * Cloud Server. Static assets first, then Vocs' Waku RSC handler
 * (`/about` → `about/index.html`, otherwise SSR).
 *
 *
 * ### Creating Vocs Sites
 * **Example:** Vocs Documentation Site
 * ```typescript
 * const docs = yield* Hetzner.Website.Vocs("Docs", {
 *   rootDir: "./docs",
 * });
 * ```
 *
 * **Example:** Custom Output Directory
 * ```typescript
 * const docs = yield* Hetzner.Website.Vocs("Docs", {
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
    htmlHandling: "drop-trailing-slash",
}).pipe(Namespace.push(id));
//# sourceMappingURL=Vocs.js.map