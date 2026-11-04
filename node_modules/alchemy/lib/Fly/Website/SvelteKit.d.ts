import { type FrameworkSiteProps } from "./FrameworkSite.ts";
/** The framework-integration package that drives the SvelteKit build. */
export declare const SVELTEKIT_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/sveltekit";
/** The Node container deploy target for the SvelteKit build. */
export declare const SVELTEKIT_NODE_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/sveltekit/node";
export interface SvelteKitProps extends FrameworkSiteProps {
    /**
     * SvelteKit configuration passed to the `sveltekit(config)` Vite plugin.
     * The `adapter` field is injected by the Node deploy target and may not
     * be set here. Must be JSON-serializable.
     */
    kit?: Record<string, unknown>;
}
/**
 * Deploy a SvelteKit application to Fly: kit's SSR server on a Machine,
 * static assets baked into the image, served assets-first then the
 * framework handler.
 *
 *
 * ### Creating SvelteKit Sites
 * **Example:** Basic SvelteKit App
 * ```typescript
 * const site = yield* Fly.Website.SvelteKit("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * **Example:** Custom Domain
 * ```typescript
 * const site = yield* Fly.Website.SvelteKit("Web", {
 *   rootDir: "./app",
 *   domain: "app.example.com",
 * });
 * ```
 *
 * @resource
 * @product Website
 */
export declare const SvelteKit: (id: string, props?: SvelteKitProps) => import("effect/Effect").Effect<{
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
//# sourceMappingURL=SvelteKit.d.ts.map