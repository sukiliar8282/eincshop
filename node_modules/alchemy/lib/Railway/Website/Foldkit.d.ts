import { type ViteProps } from "./Vite.ts";
export interface FoldkitProps extends ViteProps {
}
/**
 * Deploy a [Foldkit](https://foldkit.dev) app to Railway: a Vite SPA with
 * unmatched paths falling back to `index.html` so deep links boot the
 * Foldkit router. Same Node static-file Service as {@link Vite}.
 *
 * Foldkit apps are client-only Vite projects — the Foldkit Vite plugin in
 * the app's `vite.config.ts` composes with the project's own Vite build.
 *
 * During `alchemy dev` the site is Vite's own dev server and no cloud
 * resources are created. `Alchemy.remote()` opts back into the live
 * Service path.
 *
 * ### Deploying a Foldkit App
 * **Example:** Foldkit app
 * ```typescript
 * const site = yield* Railway.Website.Foldkit("Website");
 * ```
 *
 * **Example:** Foldkit project in a subdirectory
 * ```typescript
 * const site = yield* Railway.Website.Foldkit("Website", {
 *   rootDir: "applications/web",
 * });
 * ```
 *
 * ### Single-Page Application Routing
 * **Example:** Serving a real 404 page
 * ```typescript
 * const site = yield* Railway.Website.Foldkit("Website", {
 *   assets: { notFoundHandling: "404-page" },
 * });
 * ```
 *
 * @resource
 * @product Website
 */
export declare const Foldkit: (id: string, props?: FoldkitProps) => import("effect/Effect").Effect<{
    url: import("../../Output.ts").Output<string | undefined, never>;
    service: undefined;
    project: undefined;
} | {
    url: string;
    service: import("../Service.ts").Service;
    project: import("../Project.ts").Project;
} | {
    url: import("../../Output.ts").Output<string | undefined, never>;
    service: import("../Service.ts").Service;
    project: import("../Project.ts").Project;
}, never, import("../../AlchemyContext.ts").AlchemyContext | import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("../../Provider.ts").Provider<import("../../Website/Server.ts").Server> | import("../Providers.ts").Providers>;
//# sourceMappingURL=Foldkit.d.ts.map