import { type FrameworkSiteProps } from "./FrameworkSite.ts";
/** The framework-integration package that drives the React Router build. */
export declare const REACT_ROUTER_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/react-router";
/** The Node container deploy target for the React Router build. */
export declare const REACT_ROUTER_NODE_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/react-router/node";
export interface ReactRouterProps extends FrameworkSiteProps {
}
/**
 * Deploy a [React Router](https://reactrouter.com) v7 app (framework mode)
 * to Railway: the SSR server plus client assets on one `Railway.Service`.
 *
 * The build runs through
 * `@alchemy.run/frontend-frameworks/react-router` with the
 * `@alchemy.run/frontend-frameworks/react-router/node` deploy target — both
 * must be installed in your project, alongside `@react-router/dev`,
 * `react-router`, and `vite`.
 *
 * Your `vite.config.ts` needs no adapter wiring. React Router's server
 * build is a `ServerBuild` manifest rather than a request handler, so the
 * integration wraps the manifest with `createRequestHandler` and packages
 * the resulting fetch handler as a Node HTTP server on port 3000.
 *
 * React Server Components (React Router's `unstable` RSC plugin) and
 * multi-environment builds are not supported yet — the build fails with an
 * actionable error when more than one server entry is emitted.
 *
 * During `alchemy dev` the site is React Router's own Vite dev server and
 * no cloud resources are created. `Alchemy.remote()` opts back into the
 * live Service path.
 *
 * ### Creating React Router Sites
 * **Example:** Basic React Router App
 * ```typescript
 * const site = yield* Railway.Website.ReactRouter("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * **Example:** Custom Domain
 * ```typescript
 * const site = yield* Railway.Website.ReactRouter("Web", {
 *   rootDir: "./app",
 *   domain: "app.example.com",
 * });
 * ```
 *
 * ### Server Configuration
 * **Example:** Process Environment
 * ```typescript
 * const site = yield* Railway.Website.ReactRouter("Web", {
 *   rootDir: "./app",
 *   env: {
 *     GREETING: "Hello from React Router on Railway!",
 *   },
 * });
 * ```
 *
 * **Example:** Read An Environment Variable From A Loader
 * ```typescript
 * // app/routes/home.tsx
 * export function loader() {
 *   return { apiBase: process.env.API_BASE ?? "unset" };
 * }
 * ```
 *
 * @resource
 * @product Website
 */
export declare const ReactRouter: (id: string, props?: ReactRouterProps) => import("effect/Effect").Effect<{
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
//# sourceMappingURL=ReactRouter.d.ts.map