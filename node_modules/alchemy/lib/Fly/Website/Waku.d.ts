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
        /**
         * Source directory, relative to `rootDir` (waku's `srcDir`).
         * @default the project's `waku.config.*` value, or `"src"`
         */
        srcDir?: string;
        /**
         * Build output directory (waku's `distDir`).
         * @default the project's `waku.config.*` value, or `"dist"`
         */
        distDir?: string;
        /** Public base path the site deploys under (waku's `basePath`). */
        basePath?: string;
    };
}
/**
 * Deploy a [Waku](https://waku.gg) application to Fly: the RSC server on a
 * Machine, static assets (SSG pages included) baked into the image.
 * Prerendered pages are served extensionless (`/about`).
 *
 *
 * ### Creating Waku Sites
 * **Example:** Basic Waku App
 * ```typescript
 * const site = yield* Fly.Website.Waku("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * **Example:** Custom Domain
 * ```typescript
 * const site = yield* Fly.Website.Waku("Web", {
 *   rootDir: "./app",
 *   domain: "app.example.com",
 * });
 * ```
 *
 * @resource
 * @product Website
 */
export declare const Waku: (id: string, props?: WakuProps) => import("effect/Effect").Effect<{
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
//# sourceMappingURL=Waku.d.ts.map