import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import { type MemoOptions } from "../Command/Memo.ts";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
declare const FrameworkServerError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "FrameworkServerError";
} & Readonly<A>;
export declare class FrameworkServerError extends FrameworkServerError_base<{
    readonly framework: string;
    readonly message: string;
    readonly cause?: unknown;
}> {
}
/**
 * Options for the local dev server that runs a framework site under
 * `alchemy dev`.
 *
 * Use `{ mode: "external" }` to skip starting a dev server entirely —
 * useful when an external dev server (e.g. one you run yourself in
 * another terminal) is serving the site instead.
 */
export type ServerDevProps = {
    /**
     * Run the framework's own dev server locally (the default).
     * @default "server"
     */
    mode?: "server";
    /**
     * Host the dev server binds to. Defaults to the framework's own
     * choice (localhost).
     */
    host?: string;
    /**
     * Preferred port for the dev server. Defaults to an ephemeral port.
     * If the port is unavailable, the next free port is used unless
     * {@link strictPort} is `true`.
     */
    port?: number;
    /**
     * When `true`, fail instead of falling back to another port if
     * {@link port} is already in use.
     * @default false
     */
    strictPort?: boolean;
} | {
    /**
     * Don't start a dev server; an external dev server is running instead.
     */
    mode: "external";
    /**
     * URL the external dev server is reachable at, if applicable.
     * This will be returned as the `url` attribute of the Server resource.
     */
    url?: string;
};
export interface ServerProps {
    /**
     * Module specifier of the framework-integration package that implements
     * the build and dev server (e.g. `"@alchemy.run/frontend-frameworks/nuxt"`). Must be
     * installed in your project — it is loaded dynamically at deploy time and
     * drives your project's own framework toolchain.
     */
    framework: string;
    /**
     * Project root directory (the directory containing the framework config),
     * relative to the process working directory.
     * @default "."
     */
    root?: string;
    /**
     * The deploy target the build is produced for: a module specifier
     * resolved from your project's `node_modules`
     * (e.g. `"@alchemy.run/frontend-frameworks/nuxt/aws"`).
     */
    target: string;
    /**
     * Framework-integration options forwarded to the module's `make()`
     * (e.g. `{ nuxt: { ... } }` config overrides). Must be JSON-serializable —
     * the value participates in the memo hash and is persisted in state.
     */
    options?: Record<string, unknown>;
    /**
     * Options for the local dev server that runs this site under
     * `alchemy dev`. See {@link ServerDevProps}.
     */
    dev?: ServerDevProps;
    /**
     * Environment variables for the framework server. On deploy the
     * composite sets these on the Lambda; during `alchemy dev` they are
     * applied to the dev server's process environment (the dev sidecar and
     * any child it spawns) so server code reads the same values in both
     * modes. Changing a value restarts the dev server.
     *
     * Entries whose value is `undefined` are dropped — this lets website
     * composites forward optional values (e.g. an `Output` service URL that
     * resolves to `undefined`) without filtering first.
     */
    env?: Record<string, string | undefined>;
    /**
     * Controls which files are hashed to decide whether the build should
     * re-run. By default every non-gitignored file in the root is hashed,
     * plus the nearest lockfile. Set `false` to rebuild on every deploy.
     * @default true
     */
    memo?: MemoOptions | boolean;
}
export interface Server extends Resource<"Website.Server", ServerProps, {
    /**
     * Root output directory of the build (e.g. `.output`), relative to the
     * process's initial working directory. `undefined` in dev mode (no
     * production build runs).
     */
    distDir: string | undefined;
    /**
     * Static-assets directory of the build (prerendered pages included),
     * relative to the initial working directory. `undefined` when the build
     * produced no client assets, and in dev mode.
     */
    clientDir: string | undefined;
    /**
     * The server entry module on disk (e.g. `.output/server/index.mjs`),
     * relative to the initial working directory. `undefined` for
     * assets-only builds, and in dev mode.
     */
    serverEntry: string | undefined;
    /**
     * The framework dev server's local URL (e.g. `http://localhost:3000`)
     * during `alchemy dev`. `undefined` on deploys.
     */
    url: string | undefined;
    hash: {
        /**
         * Hash of the input files (plus framework/target/options) that
         * produced this build. `undefined` in dev mode.
         */
        input: string | undefined;
        /**
         * Hash of the build output files. `undefined` in dev mode.
         */
        output: string | undefined;
    };
}> {
}
/**
 * The framework toolchain half of a website: on `alchemy deploy` it
 * runs the framework's production build with a platform deploy target and
 * tracks the on-disk output in state; on `alchemy dev` it runs the
 * framework's OWN dev server (native HMR via the framework's kit) in the
 * dev sidecar and exposes its local URL. Shared by AWS, Fly, Hetzner, and
 * Railway website composites.
 *
 * The framework package and the target module are loaded from *your*
 * project's `node_modules`, so your project's framework version drives the
 * build. Build inputs are content-hashed so an unchanged project skips the
 * rebuild entirely.
 *
 * ### Building Frameworks
 * **Example:** Nuxt For AWS Lambda
 * ```typescript
 * const server = yield* Server("Server", {
 *   framework: "@alchemy.run/frontend-frameworks/nuxt",
 *   target: "@alchemy.run/frontend-frameworks/nuxt/aws",
 *   root: "./app",
 * });
 * // deploy: server.serverEntry -> .output/server/index.mjs (Lambda handler)
 * //         server.clientDir   -> .output/public (static assets for the CDN)
 * // dev:    server.url         -> http://localhost:<port> (framework HMR server)
 * ```
 *
 * @resource
 */
export declare const Server: import("../Resource.ts").ResourceClass<Server>;
export declare const ServerProvider: () => import("effect/Layer").Layer<Provider.Provider<Server>, never, import("../AlchemyContext.ts").AlchemyContext | import("../Artifacts.ts").ArtifactStore | FileSystem.FileSystem | Path.Path | import("../Stack.ts").Stack>;
export declare const ServerProviderLive: () => import("effect/Layer").Layer<Provider.Provider<Server>, never, FileSystem.FileSystem | Path.Path>;
/**
 * The `alchemy dev` variant: runs the framework's own dev server (native
 * HMR through the framework's kit — nuxt, astro, ...) inside the dev
 * sidecar, so it survives user-code hot reloads. Restarts when the
 * framework/target/root/options config changes.
 */
export declare const ServerProviderLocal: () => import("effect/Layer").Layer<Provider.Provider<Server>, never, import("../AlchemyContext.ts").AlchemyContext | import("../Artifacts.ts").ArtifactStore | FileSystem.FileSystem | Path.Path | import("../Stack.ts").Stack>;
export {};
//# sourceMappingURL=Server.d.ts.map