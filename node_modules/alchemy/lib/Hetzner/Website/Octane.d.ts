import { type FrameworkSiteProps } from "./FrameworkSite.ts";
/** The framework-integration package that drives the Octane build. */
export declare const OCTANE_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/octane";
/** The Node container deploy target for the Octane build. */
export declare const OCTANE_NODE_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/octane/node";
export interface OctaneProps extends FrameworkSiteProps {
}
/**
 * Deploy an [OctaneJS](https://octanejs.dev) application to a Hetzner
 * Cloud Server: Octane's SSR server as a systemd unit on port 3000,
 * static assets baked into the unit.
 *
 * The project's `octane.config.ts` must select the Node marker adapter:
 *
 * ```ts
 * import { node } from "@alchemy.run/frontend-frameworks/octane/node-adapter";
 * import { defineConfig } from "@octanejs/vite-plugin";
 *
 * export default defineConfig({
 *   adapter: node(),
 * });
 * ```
 *
 *
 * ### Creating Octane Sites
 * **Example:** Basic Octane App
 * ```typescript
 * const site = yield* Hetzner.Website.Octane("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * **Example:** Custom Domain
 * ```typescript
 * const site = yield* Hetzner.Website.Octane("Web", {
 *   rootDir: "./app",
 *   domain: "app.example.com",
 *   zone,
 * });
 * ```
 *
 * @resource
 * @product Website
 */
export declare const Octane: (id: string, props?: OctaneProps) => import("effect/Effect").Effect<{
    url: import("../../Output.ts").Output<string | undefined, never>;
    server: undefined;
    service: undefined;
} | {
    url: string | import("../../Output.ts").Output<string | undefined, never>;
    server: import("../Server.ts").Server;
    service: import("../Service.ts").Service;
}, never, import("../../AlchemyContext.ts").AlchemyContext | import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("../../Provider.ts").Provider<import("../../Website/Server.ts").Server> | import("../Providers.ts").Providers>;
//# sourceMappingURL=Octane.d.ts.map