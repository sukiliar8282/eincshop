import { type FrameworkSiteProps } from "./FrameworkSite.ts";
/** The framework-integration package that drives the Waku build. */
export declare const WAKU_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/waku";
/** The Node container deploy target for the Waku build. */
export declare const WAKU_NODE_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/waku/node";
export interface WakuProps extends FrameworkSiteProps {
    /**
     * Serializable Waku config merged OVER the project's own
     * `waku.config.*`.
     */
    waku?: {
        srcDir?: string;
        distDir?: string;
        basePath?: string;
    };
}
/**
 * Deploy a [Waku](https://waku.gg) application to a Hetzner Cloud Server:
 * the RSC server as a systemd unit on port 3000, static assets (SSG
 * pages included) baked into the unit. Prerendered pages are served
 * extensionless (`/about` not `/about/`).
 *
 *
 * ### Creating Waku Sites
 * **Example:** Basic Waku App
 * ```typescript
 * const site = yield* Hetzner.Website.Waku("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * **Example:** Custom Domain
 * ```typescript
 * const site = yield* Hetzner.Website.Waku("Web", {
 *   rootDir: "./app",
 *   domain: "app.example.com",
 *   zone,
 * });
 * ```
 *
 * @resource
 * @product Website
 */
export declare const Waku: (id: string, props?: WakuProps) => import("effect/Effect").Effect<{
    url: import("../../Output.ts").Output<string | undefined, never>;
    server: undefined;
    service: undefined;
} | {
    url: string | import("../../Output.ts").Output<string | undefined, never>;
    server: import("../Server.ts").Server;
    service: import("../Service.ts").Service;
}, never, import("../../AlchemyContext.ts").AlchemyContext | import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("../../Provider.ts").Provider<import("../../Website/Server.ts").Server> | import("../Providers.ts").Providers>;
//# sourceMappingURL=Waku.d.ts.map