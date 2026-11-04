import { type FrameworkSiteProps } from "./FrameworkSite.ts";
/** The framework-integration package that drives the Nuxt build. */
export declare const NUXT_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/nuxt";
/** The Node container deploy target for the Nuxt build. */
export declare const NUXT_NODE_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/nuxt/node";
export interface NuxtProps extends FrameworkSiteProps {
    /**
     * Nuxt config overrides merged over the project's own `nuxt.config.ts`
     * (highest-priority layer). `nitro.preset` is owned by the Node deploy
     * target and may not be set here.
     */
    nuxt?: Record<string, unknown>;
}
/**
 * Deploy a Nuxt application to Fly: the nitro Node server on a Machine,
 * static assets (prerendered pages included) baked into the image.
 *
 *
 * ### Creating Nuxt Sites
 * **Example:** Basic Nuxt App
 * ```typescript
 * const site = yield* Fly.Website.Nuxt("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * **Example:** Custom Domain
 * ```typescript
 * const site = yield* Fly.Website.Nuxt("Web", {
 *   rootDir: "./app",
 *   domain: "app.example.com",
 * });
 * ```
 *
 * @resource
 * @product Website
 */
export declare const Nuxt: (id: string, props?: NuxtProps) => import("effect/Effect").Effect<{
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
//# sourceMappingURL=Nuxt.d.ts.map