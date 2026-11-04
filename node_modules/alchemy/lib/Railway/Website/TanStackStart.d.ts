import { type FrameworkSiteProps } from "./FrameworkSite.ts";
/** The framework-integration package that drives the TanStack Start build. */
export declare const TANSTACK_START_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/tanstack-start";
/** The Node container deploy target for the TanStack Start build. */
export declare const TANSTACK_START_NODE_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/tanstack-start/node";
export interface TanStackStartProps extends FrameworkSiteProps {
}
/**
 * Deploy a [TanStack Start](https://tanstack.com/start) application to
 * Railway: the SSR server plus client assets on one `Railway.Service`.
 *
 * The build runs through
 * `@alchemy.run/frontend-frameworks/tanstack-start` with the
 * `@alchemy.run/frontend-frameworks/tanstack-start/node` deploy target —
 * both must be installed in your project, alongside
 * `@tanstack/react-start` (or `@tanstack/solid-start`) and `vite`.
 *
 * Your `vite.config.ts` needs no adapter wiring: TanStack Start is pure
 * Vite, so the integration drives the project's own `vite build`, forces
 * the SSR bundle to be self-contained, and wraps its fetch handler as a
 * Node HTTP server on port 3000.
 *
 * During `alchemy dev` the site is TanStack Start's own Vite dev server
 * and no cloud resources are created. `Alchemy.remote()` opts back into
 * the live Service path.
 *
 * ### Creating TanStack Start Sites
 * **Example:** Basic TanStack Start App
 * ```typescript
 * const site = yield* Railway.Website.TanStackStart("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * **Example:** Custom Domain
 * ```typescript
 * const site = yield* Railway.Website.TanStackStart("Web", {
 *   rootDir: "./app",
 *   domain: "app.example.com",
 * });
 * ```
 *
 * ### Server Configuration
 * **Example:** Process Environment
 * ```typescript
 * const site = yield* Railway.Website.TanStackStart("Web", {
 *   rootDir: "./app",
 *   env: {
 *     GREETING: "Hello from TanStack Start on Railway!",
 *   },
 * });
 * ```
 *
 * **Example:** Read An Environment Variable From A Server Function
 * ```typescript
 * // src/routes/index.tsx
 * const getApiBase = createServerFn({ method: "GET" }).handler(() => ({
 *   apiBase: process.env.API_BASE,
 * }));
 * ```
 *
 * @resource
 * @product Website
 */
export declare const TanStackStart: (id: string, props?: TanStackStartProps) => import("effect/Effect").Effect<{
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
//# sourceMappingURL=TanStackStart.d.ts.map