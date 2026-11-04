import { type FrameworkSiteProps } from "./FrameworkSite.ts";
/** The framework-integration package that drives the TanStack Start build. */
export declare const TANSTACK_START_FRAMEWORK_SPECIFIER = "@alchemy.run/frontend-frameworks/tanstack-start";
/** The Node container deploy target for the TanStack Start build. */
export declare const TANSTACK_START_NODE_TARGET_SPECIFIER = "@alchemy.run/frontend-frameworks/tanstack-start/node";
export interface TanStackStartProps extends FrameworkSiteProps {
}
/**
 * Deploy a [TanStack Start](https://tanstack.com/start) application to Fly:
 * the SSR server on a Machine, client assets baked into the image, served
 * assets-first then the framework handler.
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
 *
 * ### Creating TanStack Start Sites
 * **Example:** Basic TanStack Start App
 * ```typescript
 * const site = yield* Fly.Website.TanStackStart("Web", {
 *   rootDir: "./app",
 * });
 * ```
 *
 * **Example:** Custom Domain
 * ```typescript
 * const site = yield* Fly.Website.TanStackStart("Web", {
 *   rootDir: "./app",
 *   domain: "app.example.com",
 * });
 * ```
 *
 * ### Server Configuration
 * **Example:** Process Environment
 * ```typescript
 * const site = yield* Fly.Website.TanStackStart("Web", {
 *   rootDir: "./app",
 *   env: {
 *     GREETING: "Hello from TanStack Start on Fly!",
 *   },
 * });
 * ```
 *
 * **Example:** Read An Environment Variable From A Server Function
 * ```typescript
 * // src/routes/index.tsx
 * const getGreeting = createServerFn({ method: "GET" }).handler(
 *   () => process.env.GREETING ?? "Hello!",
 * );
 * ```
 *
 * @resource
 * @product Website
 */
export declare const TanStackStart: (id: string, props?: TanStackStartProps) => import("effect/Effect").Effect<{
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
//# sourceMappingURL=TanStackStart.d.ts.map