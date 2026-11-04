import { type FrameworkSiteProps } from "./FrameworkSite.ts";
/** The framework-integration package that drives the Vite build. */
export declare const VITE_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/vite";
/** The Node container deploy target for the Vite build. */
export declare const VITE_NODE_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/vite/node";
export interface ViteProps extends FrameworkSiteProps {
    /**
     * Serializable Vite config merged OVER the project's own `vite.config.*`.
     */
    vite?: {
        outDir?: string;
        base?: string;
    };
}
/**
 * Deploy a plain [Vite](https://vite.dev) application to a Hetzner Cloud
 * Server: `vite build` output served by a static-file systemd unit on
 * port 3000. For client-only projects — React/Vue/Solid SPAs,
 * `index.html` multi-page apps — whose entire deployable output is
 * static assets.
 *
 * The build runs through `@alchemy.run/frontend-frameworks/vite` with the
 * `@alchemy.run/frontend-frameworks/vite/node` deploy target — the package
 * must be installed in your project. During `alchemy dev` the site is
 * Vite's own dev server and no cloud resources are created.
 *
 *
 * ### Creating Vite Sites
 * **Example:** Basic Vite SPA
 * ```typescript
 * const site = yield* Hetzner.Website.Vite("Web");
 * ```
 *
 * **Example:** Project in a Subdirectory
 * ```typescript
 * const site = yield* Hetzner.Website.Vite("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * **Example:** Existing Server
 * ```typescript
 * const server = yield* Hetzner.Server("box", {
 *   serverType: "cpx12",
 *   image: "ubuntu-24.04",
 *   location: "fsn1",
 * });
 * const site = yield* Hetzner.Website.Vite("Web", { server });
 * ```
 *
 * ### Multi-Page Sites
 * **Example:** Per-Route HTML Pages with a 404 Page
 * ```typescript
 * const site = yield* Hetzner.Website.Vite("Docs", {
 *   assets: { notFoundHandling: "404-page" },
 * });
 * ```
 *
 * ### Custom Domain
 * **Example:** A Record on an Existing Zone
 * ```typescript
 * const site = yield* Hetzner.Website.Vite("Web", {
 *   domain: "app.example.com",
 *   zone,
 * });
 * ```
 *
 * ### Build Configuration
 * **Example:** Custom Output Directory and Base Path
 * ```typescript
 * const site = yield* Hetzner.Website.Vite("Docs", {
 *   outDir: "build",
 *   base: "/docs/",
 * });
 * ```
 *
 * ### Local Development
 * **Example:** Vite Dev Server Under `alchemy dev`
 * ```typescript
 * // `alchemy dev` starts `vite` programmatically: site.url is the local
 * // dev server (HMR included); no Server or Service is created.
 * const site = yield* Hetzner.Website.Vite("Web");
 * ```
 *
 * @resource
 * @product Website
 */
export declare const Vite: (id: string, props?: ViteProps) => import("effect/Effect").Effect<{
    url: import("../../Output.ts").Output<string | undefined, never>;
    server: undefined;
    service: undefined;
} | {
    url: string | import("../../Output.ts").Output<string | undefined, never>;
    server: import("../Server.ts").Server;
    service: import("../Service.ts").Service;
}, never, import("../../AlchemyContext.ts").AlchemyContext | import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("../../Provider.ts").Provider<import("../../Website/Server.ts").Server> | import("../Providers.ts").Providers>;
//# sourceMappingURL=Vite.d.ts.map