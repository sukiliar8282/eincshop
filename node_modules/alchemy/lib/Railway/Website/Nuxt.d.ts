import { type FrameworkSiteProps } from "./FrameworkSite.ts";
/** The framework-integration package that drives the Nuxt build. */
export declare const NUXT_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/nuxt";
/** The Node container deploy target for the Nuxt build. */
export declare const NUXT_NODE_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/nuxt/node";
export interface NuxtProps extends FrameworkSiteProps {
    /**
     * Nuxt config overrides merged over the project's own `nuxt.config.ts`
     * (highest-priority layer). `nitro.preset` is owned by the Node deploy
     * target (`"node"`) and may not be set here.
     */
    nuxt?: Record<string, unknown>;
}
/**
 * Deploy a Nuxt application to Railway: the nitro Node server plus
 * prerendered assets on one `Railway.Service`. The Node deploy target
 * enforces nitro's `node` preset; do not set `nitro.preset`.
 *
 * During `alchemy dev` the site is Nuxt's own dev server and no cloud
 * resources are created. `Alchemy.remote()` opts back into the live
 * Service path.
 *
 * ### Creating Nuxt Sites
 * **Example:** Basic Nuxt App
 * ```typescript
 * const site = yield* Railway.Website.Nuxt("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * ### Server Configuration
 * **Example:** Process Environment
 * ```typescript
 * const site = yield* Railway.Website.Nuxt("Web", {
 *   rootDir: "./app",
 *   env: {
 *     NUXT_PUBLIC_API_BASE: "https://api.example.com",
 *   },
 * });
 * ```
 *
 * @resource
 * @product Website
 */
export declare const Nuxt: (id: string, props?: NuxtProps) => import("effect/Effect").Effect<{
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
//# sourceMappingURL=Nuxt.d.ts.map