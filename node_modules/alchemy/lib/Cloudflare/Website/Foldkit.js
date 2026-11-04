import * as Effect from "effect/Effect";
import { effectClass } from "../../Util/effect.js";
import { Worker, } from "../Workers/Worker.js";
/**
 * A Cloudflare Worker deployed from a [Foldkit](https://foldkit.dev) app.
 *
 * Foldkit apps are client-only Vite projects, so `Foldkit` drives the
 * project's own `vite build` — the Foldkit Vite plugin in the app's
 * `vite.config.ts` composes with the injected Cloudflare plugin — and
 * deploys the client output as static assets. No Wrangler configuration,
 * build command, or output directory required.
 *
 * Input files are content-hashed (respecting `.gitignore` by default) so
 * unchanged projects skip the build and deploy entirely.
 *
 * Foldkit apps route on the client, so `assets.notFoundHandling`
 * defaults to `"single-page-application"` — deep links serve
 * `index.html` and the Foldkit router takes over.
 *
 *
 * ### Deploying a Foldkit App
 * A single call builds the project and deploys the client output as
 * static assets — no configuration required.
 *
 * **Example:** Foldkit app
 * ```typescript
 * const site = yield* Cloudflare.Website.Foldkit("Website");
 * ```
 *
 * **Example:** Foldkit project in a subdirectory
 * ```typescript
 * const site = yield* Cloudflare.Website.Foldkit("Website", {
 *   rootDir: "applications/web",
 * });
 * ```
 *
 * ### Single-Page Application Routing
 * Unmatched paths serve `index.html` by default so deep links boot the
 * app and the Foldkit router resolves the route. A site that ships real
 * 404 content overrides the default with `notFoundHandling: "404-page"`.
 *
 * **Example:** Serving a real 404 page
 * ```typescript
 * const site = yield* Cloudflare.Website.Foldkit("Website", {
 *   assets: {
 *     notFoundHandling: "404-page",
 *   },
 * });
 * ```
 *
 * ### Custom Worker Entry
 * By default the deployment is assets-only. When code must run at the
 * edge — API routes, error reporting, Durable Object classes — point
 * `main` at your own module that serves the client build through the
 * `ASSETS` binding (see {@link FoldkitProps.main}). Bindings passed in
 * `env` are reachable from the entry (and from cron handlers), not from
 * browser code — a Foldkit app runs on the client, so anything it needs
 * must come from a route the Worker serves.
 *
 * **Example:** Custom entry serving an API route from a KV namespace
 * ```typescript
 * const ticker = yield* Cloudflare.KV.Namespace("Ticker");
 *
 * const site = yield* Cloudflare.Website.Foldkit("Platform", {
 *   main: "src/worker.ts",
 *   env: {
 *     TICKER: ticker,
 *   },
 * });
 * ```
 *
 * ### Custom Rebuild Scope
 * By default, every non-gitignored file is hashed to decide whether a
 * rebuild is needed. Use `memo` to narrow the scope when your project
 * has large directories that don't affect the build output.
 *
 * **Example:** Narrowing the memo scope
 * ```typescript
 * const site = yield* Cloudflare.Website.Foldkit("Website", {
 *   memo: {
 *     include: ["src/**", "public/**", "package.json"],
 *   },
 * });
 * ```
 *
 * ### Class Form
 * Calling `Foldkit` with no arguments returns a constructor you can
 * `extend` to declare the Worker as a named class. The class is both an
 * `Effect` you can `yield*` to deploy and a type you can reference
 * elsewhere — useful when other resources need to bind to this Worker.
 *
 * **Example:** Declaring a Worker class
 * ```typescript
 * class Website extends Cloudflare.Website.Foldkit<Website>()("Website") {}
 *
 * const site = yield* Website;
 * ```
 *
 * @resource
 * @product Website
 * @category Workers & Compute
 */
export const Foldkit = ((id, propsEff) => id === undefined
    ? (id, propsEff) => effectClass(Foldkit(id, propsEff))
    : Worker(id, Effect.map(Effect.isEffect(propsEff) ? propsEff : Effect.succeed(propsEff), (props) => ({
        ...props,
        // Foldkit routes on the client; serve index.html for unmatched
        // paths so deep links boot the app instead of 404ing. An
        // explicit `assets.notFoundHandling` wins over the default.
        assets: {
            notFoundHandling: "single-page-application",
            ...props?.assets,
        },
        main: undefined,
        vite: {
            main: props?.main,
            rootDir: props?.rootDir,
            memo: props?.memo,
        },
    }))));
//# sourceMappingURL=Foldkit.js.map