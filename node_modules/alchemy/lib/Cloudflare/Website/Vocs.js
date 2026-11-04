import * as Effect from "effect/Effect";
import { effectClass } from "../../Util/effect.js";
import { Worker, } from "../Workers/Worker.js";
const VOCS_SOURCE_PROVIDER = "@alchemy.run/frontend-frameworks/vocs/source";
/**
 * A Cloudflare Worker deployed from a [Vocs](https://vocs.dev) documentation project.
 *
 * Vocs' `vocs.config.*` loads natively. Alchemy runs Vocs' Waku/RSC build,
 * deploys its server environments as a Worker, and publishes the client and
 * prerendered output as static assets. No Vite or Wrangler config is required.
 *
 * Requires `@alchemy.run/frontend-frameworks`, `vocs`, and Vocs' Waku peer
 * dependencies in the project.
 *
 * Input files are content-hashed (respecting `.gitignore` by default), so an
 * unchanged project skips its build and deployment. Vocs' server runtime uses
 * Node APIs, enabled by the Worker's compatibility date
 * flags automatically.
 *
 * ### Deploying a Vocs Site
 * A single resource builds the documentation project and deploys its server
 * runtime, prerendered pages, generated files, and public assets.
 *
 * **Example:** Vocs documentation site
 * ```typescript
 * const docs = yield* Cloudflare.Website.Vocs("Docs", {
 *   rootDir: "./docs",
 * });
 * ```
 *
 * ### Bindings
 * Pass Cloudflare resources through `env` like any other Worker. Server-side
 * Vocs and MDX code can access them from `cloudflare:workers`.
 *
 * **Example:** Vocs with a KV namespace
 * ```typescript
 * const searchCache = yield* Cloudflare.KV.Namespace("SearchCache");
 *
 * const docs = yield* Cloudflare.Website.Vocs("Docs", {
 *   rootDir: "./docs",
 *   env: {
 *     SEARCH_CACHE: searchCache,
 *   },
 * });
 * ```
 *
 * ### Custom Build Output
 * Vocs configuration continues to own the output directory. When
 * `vocs.config.*` changes `outDir`, mirror that value on the resource so the
 * generated directory is excluded from the rebuild hash and read correctly.
 *
 * **Example:** Custom output directory
 * ```typescript
 * // vocs.config.ts: defineConfig({ outDir: "build" })
 * const docs = yield* Cloudflare.Website.Vocs("Docs", {
 *   rootDir: "./docs",
 *   outDir: "build",
 * });
 * ```
 *
 * ### Custom Rebuild Scope
 * Use `memo` to narrow the files that trigger a rebuild in large projects.
 *
 * **Example:** Narrowing the memo scope
 * ```typescript
 * const docs = yield* Cloudflare.Website.Vocs("Docs", {
 *   rootDir: "./docs",
 *   memo: {
 *     include: ["src/**", "public/**", "vocs.config.ts", "package.json"],
 *   },
 * });
 * ```
 *
 * ### Class Form
 * Calling `Vocs` without arguments returns a constructor for declaring the
 * deployed Worker as a named class.
 *
 * **Example:** Declaring a Vocs Worker class
 * ```typescript
 * class Docs extends Cloudflare.Website.Vocs<Docs>()("Docs", {
 *   rootDir: "./docs",
 * }) {}
 *
 * const docs = yield* Docs;
 * ```
 *
 * @resource
 * @product Website
 * @category Workers & Compute
 */
export const Vocs = ((id, propsEff) => id === undefined
    ? (id, propsEff) => effectClass(Vocs(id, propsEff))
    : Worker(id, Effect.map(Effect.isEffect(propsEff) ? propsEff : Effect.succeed(propsEff), (props) => ({
        ...props,
        // The Worker compatibility resolver enables Node.js APIs from
        // the date (or adds the flag when a caller pins an older date).
        assets: {
            htmlHandling: "drop-trailing-slash",
            ...props?.assets,
        },
        main: undefined,
        source: {
            provider: VOCS_SOURCE_PROVIDER,
            devMode: "server",
            options: {
                rootDir: props?.rootDir,
                outDir: props?.outDir,
                memo: props?.memo,
            },
        },
    }))));
//# sourceMappingURL=Vocs.js.map