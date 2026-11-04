import { type FrameworkSiteProps } from "./FrameworkSite.ts";
/** The framework-integration package that drives the Vocs build. */
export declare const VOCS_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/vocs/node";
/** The Node container deploy target for the Vocs build. */
export declare const VOCS_NODE_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/vocs/node";
export interface VocsProps extends FrameworkSiteProps {
    /**
     * Vocs build output directory, relative to {@link FrameworkSiteProps.rootDir}.
     * Set this when `vocs.config.*` customizes `outDir`.
     * @default "dist"
     */
    outDir?: string;
}
/**
 * Deploy a [Vocs](https://vocs.dev) documentation site to Fly. The node
 * target serves static assets first, then Vocs' Waku RSC handler
 * (`/about` → `about/index.html`, otherwise SSR).
 *
 *
 * ### Creating Vocs Sites
 * **Example:** Vocs documentation site
 * ```typescript
 * const docs = yield* Fly.Website.Vocs("Docs", {
 *   rootDir: "./docs",
 * });
 * ```
 *
 * **Example:** Custom output directory
 * ```typescript
 * const docs = yield* Fly.Website.Vocs("Docs", {
 *   rootDir: "./docs",
 *   outDir: "build",
 * });
 * ```
 *
 * @resource
 * @product Website
 */
export declare const Vocs: (id: string, props?: VocsProps) => import("effect/Effect").Effect<{
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
//# sourceMappingURL=Vocs.d.ts.map