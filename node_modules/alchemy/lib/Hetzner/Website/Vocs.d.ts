import { type FrameworkSiteProps } from "./FrameworkSite.ts";
/** The framework-integration package that drives the Vocs build. */
export declare const VOCS_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/vocs/node";
/** The Node container deploy target for the Vocs build. */
export declare const VOCS_NODE_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/vocs/node";
export interface VocsProps extends FrameworkSiteProps {
    /**
     * Vocs build output directory, relative to {@link rootDir}. Set this when
     * `vocs.config.*` customizes `outDir` so generated output stays outside the
     * rebuild hash.
     * @default "dist"
     */
    outDir?: string;
}
/**
 * Deploy a [Vocs](https://vocs.dev) documentation project to a Hetzner
 * Cloud Server. Static assets first, then Vocs' Waku RSC handler
 * (`/about` → `about/index.html`, otherwise SSR).
 *
 *
 * ### Creating Vocs Sites
 * **Example:** Vocs Documentation Site
 * ```typescript
 * const docs = yield* Hetzner.Website.Vocs("Docs", {
 *   rootDir: "./docs",
 * });
 * ```
 *
 * **Example:** Custom Output Directory
 * ```typescript
 * const docs = yield* Hetzner.Website.Vocs("Docs", {
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
    server: undefined;
    service: undefined;
} | {
    url: string | import("../../Output.ts").Output<string | undefined, never>;
    server: import("../Server.ts").Server;
    service: import("../Service.ts").Service;
}, never, import("../../AlchemyContext.ts").AlchemyContext | import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("../../Provider.ts").Provider<import("../../Website/Server.ts").Server> | import("../Providers.ts").Providers>;
//# sourceMappingURL=Vocs.d.ts.map