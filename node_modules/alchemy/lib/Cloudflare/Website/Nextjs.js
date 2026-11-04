import { DEFAULT_COMPATIBILITY_DATE } from "@alchemy.run/cloudflare-runtime/core/internal/constants";
import * as Effect from "effect/Effect";
import { effectClass } from "../../Util/effect.js";
import { Self, Worker, } from "../Workers/Worker.js";
/**
 * The module specifier of the Next.js source provider. Loaded with a
 * dynamic `import()`, so `@alchemy.run/frontend-frameworks` must be installed
 * in the deploying project. The provider is exposed through its `/nextjs`
 * subpath.
 */
const NEXTJS_SOURCE_PROVIDER = "@alchemy.run/frontend-frameworks/nextjs/source";
/**
 * A Cloudflare Worker deployed from a Next.js project.
 *
 * `Nextjs` builds the app with the wrangler-free OpenNext pipeline from
 * [`@alchemy.run/frontend-frameworks/nextjs`](https://github.com/alchemy-run/alchemy/tree/main/packages/frontend-frameworks/src/nextjs):
 * `next build` runs through `@opennextjs/cloudflare`, the resulting worker
 * is bundled into a self-contained ES module set, and the static assets
 * (including prerendered pages and the read-only incremental cache) deploy
 * as Workers static assets. Input files are content-hashed so unchanged
 * projects skip the build and deploy entirely.
 *
 * Both `@alchemy.run/frontend-frameworks` and its peer
 * `@opennextjs/cloudflare` must be installed in the deploying project. The
 * source provider is loaded from the package's `/nextjs` export with a dynamic
 * `import()`.
 *
 * Local dev (`alchemy dev`) defaults to preview parity — the built worker
 * served under workerd. Set `devMode: "hmr"` for the real `next dev`
 * (Turbopack HMR) with the Worker's bindings proxied onto
 * `getCloudflareContext()`.
 *
 * ISR comes in two flavors, chosen by the project's `open-next.config.ts`:
 * the zero-infra static-assets incremental cache (prerendered pages serve
 * as built; revalidation writes are a no-op), or the fully writable
 * KV-backed setup (`revalidatePath`/`revalidateTag` and time-based
 * regeneration all work) — see the Writable ISR section below. OpenNext's
 * `WORKER_SELF_REFERENCE` self service binding is always wired on deploy.
 *
 * Known limitations (upstream `@opennextjs/cloudflare`):
 * - Edge-runtime routes/pages (`export const runtime = "edge"`) are not
 *   supported — the build fails with the offending route list; remove the
 *   directive (the node runtime runs on Workers). Middleware is fine.
 * - `next/image` optimization requires a zone with Cloudflare Images;
 *   on `workers.dev`, use `unoptimized` (images serve as raw assets).
 * - Partial Prerendering / `"use cache"` (`cacheComponents`) and
 *   Pages-Router `i18n` config are untested/out of scope for now. App
 *   Router i18n via middleware works (middleware is fully supported).
 *
 *
 * ### Deploying a Next.js App
 * A single call builds the app with OpenNext and deploys the worker plus
 * its static assets. The project needs an `open-next.config.ts` — the
 * read-only static-assets incremental cache is a good default:
 *
 * ```typescript
 * // open-next.config.ts
 * import { defineCloudflareConfig } from "@opennextjs/cloudflare";
 * import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";
 *
 * export default defineCloudflareConfig({
 *   incrementalCache: staticAssetsIncrementalCache,
 * });
 * ```
 *
 * **Example:** Basic Next.js site
 * ```typescript
 * const site = yield* Cloudflare.Website.Nextjs("Site");
 * ```
 *
 * **Example:** Explicit project root
 * ```typescript
 * const site = yield* Cloudflare.Website.Nextjs("Site", {
 *   rootDir: "./apps/web",
 * });
 * ```
 *
 * ### Bindings
 * Resources passed via `env` become Worker bindings, readable in route
 * handlers and server components through OpenNext's
 * `getCloudflareContext()`.
 *
 * **Example:** Binding an R2 bucket
 * ```typescript
 * const bucket = yield* Cloudflare.R2.Bucket("Uploads");
 * const site = yield* Cloudflare.Website.Nextjs("Site", {
 *   env: {
 *     UPLOADS: bucket,
 *   },
 * });
 * ```
 *
 * ```typescript
 * // app/api/upload/route.ts
 * import { getCloudflareContext } from "@opennextjs/cloudflare";
 *
 * export async function PUT(request: Request) {
 *   const { env } = getCloudflareContext();
 *   await env.UPLOADS.put("key", await request.text());
 *   return Response.json({ ok: true });
 * }
 * ```
 *
 * ### Writable ISR
 * With the KV incremental cache, ISR revalidation actually writes:
 * `revalidatePath` / `revalidateTag` purge entries, and time-based
 * `revalidate` windows regenerate pages in the background through the
 * same-worker Durable Object queue. Configure OpenNext for it and bind
 * the pieces — `WORKER_SELF_REFERENCE` is wired automatically:
 *
 * ```typescript
 * // open-next.config.ts
 * import { defineCloudflareConfig } from "@opennextjs/cloudflare";
 * import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
 * import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";
 * import kvNextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/kv-next-tag-cache";
 *
 * export default defineCloudflareConfig({
 *   incrementalCache: kvIncrementalCache,
 *   queue: doQueue,
 *   tagCache: kvNextTagCache,
 * });
 * ```
 *
 * **Example:** Binding the writable-ISR resources
 * ```typescript
 * const incCache = yield* Cloudflare.KV.Namespace("NextIncCache");
 * const tagCache = yield* Cloudflare.KV.Namespace("NextTagCache");
 *
 * const site = yield* Cloudflare.Website.Nextjs("Site", {
 *   env: {
 *     NEXT_INC_CACHE_KV: incCache,
 *     NEXT_TAG_CACHE_KV: tagCache,
 *     // The revalidation queue: a Durable Object class shipped in the
 *     // OpenNext worker bundle itself.
 *     NEXT_CACHE_DO_QUEUE: Cloudflare.DurableObject("NEXT_CACHE_DO_QUEUE", {
 *       className: "DOQueueHandler",
 *     }),
 *   },
 * });
 * ```
 *
 * ### Custom Rebuild Scope
 * By default, every project file outside build outputs is hashed to decide
 * whether a rebuild is needed. Use `memo` to narrow the scope when the
 * project has large directories that don't affect the build output.
 *
 * **Example:** Narrowing the memo scope
 * ```typescript
 * const site = yield* Cloudflare.Website.Nextjs("Site", {
 *   memo: {
 *     include: ["app/**", "public/**", "package.json", "next.config.mjs", "open-next.config.ts"],
 *   },
 * });
 * ```
 *
 * ### Build Configuration
 * The OpenNext build pipeline (build command, minification, ...) is
 * configured in your project's `open-next.config.ts`, which loads
 * natively — the resource only deploys the result.
 *
 * ### Class Form
 * Calling `Nextjs` with no arguments returns a constructor you can
 * `extend` to declare the Worker as a named class. The class is both an
 * `Effect` you can `yield*` to deploy and a type you can reference
 * elsewhere — useful when other resources need to bind to this Worker.
 *
 * **Example:** Declaring a Worker class
 * ```typescript
 * class Site extends Cloudflare.Website.Nextjs<Site>()("Site", {
 *   rootDir: "./apps/web",
 * }) {}
 *
 * const site = yield* Site;
 * ```
 *
 * @resource
 * @product Website
 * @category Workers & Compute
 */
export const Nextjs = ((id, propsEff) => id === undefined
    ? (id, propsEff) => effectClass(Nextjs(id, propsEff))
    : Worker(id, Effect.map(Effect.isEffect(propsEff) ? propsEff : Effect.succeed(propsEff), (props) => ({
        ...props,
        // `dev.mode` is the integration's dev behavior (routed through
        // the source options below); only `port` maps onto the Worker's
        // own local-dev config.
        dev: props?.dev?.port !== undefined
            ? { port: props.dev.port }
            : undefined,
        // OpenNext's revalidation queues (memory-queue, do-queue) fetch
        // the worker back through `WORKER_SELF_REFERENCE`. Always wire
        // the self service binding — it's inert when unused, and its
        // absence turns ISR revalidation into a silent no-op. An
        // explicit user-provided `env.WORKER_SELF_REFERENCE` wins.
        env: {
            WORKER_SELF_REFERENCE: Self,
            ...props?.env,
        },
        // OpenNext requires Node.js APIs. The 2026-08-31 default date
        // enables both nodejs_compat modes, so no redundant flag is sent.
        compatibility: {
            date: props?.compatibility?.date ?? DEFAULT_COMPATIBILITY_DATE,
            flags: props?.compatibility?.flags,
        },
        // The OpenNext server owns routing: run the worker first and
        // leave asset-path rewriting off. Users can still override.
        assets: {
            runWorkerFirst: true,
            htmlHandling: "none",
            notFoundHandling: "none",
            ...props?.assets,
        },
        source: {
            provider: NEXTJS_SOURCE_PROVIDER,
            devMode: "server",
            rootDir: props?.rootDir,
            // `next dev` (Turbopack) cold-starts broken under bun (every
            // route 404s until `.next` is warm) — pin the dev child to node.
            runtime: "node",
            options: {
                root: props?.rootDir,
                memo: props?.memo,
                ...(props?.dev?.mode !== undefined
                    ? { dev: { mode: props.dev.mode } }
                    : {}),
            },
        },
    }))));
//# sourceMappingURL=Nextjs.js.map