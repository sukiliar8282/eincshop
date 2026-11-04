import { type ViteProps } from "./Vite.ts";
export interface FoldkitProps extends ViteProps {
}
/**
 * Deploy a [Foldkit](https://foldkit.dev) app to Fly. Foldkit apps are
 * client-only Vite projects, so this is {@link Vite} with SPA fallback
 * to `index.html` so deep links boot the app.
 *
 *
 * ### Creating Foldkit Sites
 * **Example:** Foldkit app
 * ```typescript
 * const site = yield* Fly.Website.Foldkit("Web");
 * ```
 *
 * **Example:** Project in a subdirectory
 * ```typescript
 * const site = yield* Fly.Website.Foldkit("Web", {
 *   rootDir: "applications/web",
 * });
 * ```
 *
 * ### Single-Page Application Routing
 * **Example:** Serving a real 404 page
 * ```typescript
 * const site = yield* Fly.Website.Foldkit("Web", {
 *   assets: { notFoundHandling: "404-page" },
 * });
 * ```
 *
 * @resource
 * @product Website
 */
export declare const Foldkit: (id: string, props?: FoldkitProps) => import("effect/Effect").Effect<{
    url: import("../../Output.ts").Output<string | undefined, never>;
    app: undefined;
    service: undefined;
    ip: undefined;
    certificate: undefined;
} | {
    url: string | import("../../Output.ts").Output<string, never>;
    app: import("../App.ts").App;
    service: import("../Service.ts").Service;
    ip: import("../IpAssignment.ts").IpAssignment;
    certificate: import("../Certificate.ts").Certificate | undefined;
}, never, import("../../AlchemyContext.ts").AlchemyContext | import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("../../Provider.ts").Provider<import("../../Website/Server.ts").Server> | import("../Providers.ts").Providers>;
//# sourceMappingURL=Foldkit.d.ts.map