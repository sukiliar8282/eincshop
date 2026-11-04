import { type ViteProps } from "./Vite.ts";
export interface FoldkitProps extends ViteProps {
}
/**
 * Deploy a [Foldkit](https://foldkit.dev) app to a Hetzner Cloud Server.
 *
 * Foldkit apps are client-only Vite projects, so this composite is the
 * Vite site with SPA fallback to `index.html` (deep links boot the app
 * and the Foldkit router takes over).
 *
 *
 * ### Creating Foldkit Sites
 * **Example:** Foldkit App
 * ```typescript
 * const site = yield* Hetzner.Website.Foldkit("Website");
 * ```
 *
 * **Example:** Project in a Subdirectory
 * ```typescript
 * const site = yield* Hetzner.Website.Foldkit("Website", {
 *   rootDir: "applications/web",
 * });
 * ```
 *
 * ### Single-Page Application Routing
 * **Example:** Serving a real 404 page
 * ```typescript
 * const site = yield* Hetzner.Website.Foldkit("Website", {
 *   assets: { notFoundHandling: "404-page" },
 * });
 * ```
 *
 * @resource
 * @product Website
 */
export declare const Foldkit: (id: string, props?: FoldkitProps) => import("effect/Effect").Effect<{
    url: import("../../Output.ts").Output<string | undefined, never>;
    server: undefined;
    service: undefined;
} | {
    url: string | import("../../Output.ts").Output<string | undefined, never>;
    server: import("../Server.ts").Server;
    service: import("../Service.ts").Service;
}, never, import("../../AlchemyContext.ts").AlchemyContext | import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("../../Provider.ts").Provider<import("../../Website/Server.ts").Server> | import("../Providers.ts").Providers>;
//# sourceMappingURL=Foldkit.d.ts.map