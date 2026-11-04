import { type CloudflareVitePluginOptions } from "@alchemy.run/cloudflare-runtime/vite";
import * as Effect from "effect/Effect";
import * as Path from "effect/Path";
import type * as vite from "vite";
import { type ViteBuildOutput } from "../../../Bundle/Vite.ts";
import { type MemoOptions } from "../../../Command/Memo.ts";
import type { SourceProvider } from "../Source.ts";
import type { ViteOptions } from "../Worker.ts";
export declare const viteDev: (rootDir: string | undefined, env: Record<string, unknown>, pluginOptions: CloudflareVitePluginOptions, serverOptions: vite.ServerOptions) => Effect.Effect<vite.ViteDevServer, never, import("effect/Scope").Scope>;
/**
 * Run a production Vite build in a child process rooted at the project
 * directory and adapt the result to the in-process {@link ViteBuildOutput}
 * shape.
 *
 * The child boundary is what makes concurrent builds safe: vite resolves a
 * relative root against live `process.cwd()`, plugins read cwd freely, and
 * build-time spawns chdir the hosting process transiently (cross-spawn's
 * PATH resolution) — so an in-process build both breaks under and causes
 * cwd races when the engine runs builds concurrently.
 */
export declare const viteBuild: (rootDir: string | undefined, env: Record<string, unknown>, pluginOptions: CloudflareVitePluginOptions, fqn: string) => Effect.Effect<{
    clientDirectory: string | undefined;
    base: string | undefined;
    serverBundle: Effect.Effect<import("../../../Bundle/Bundle.ts").BundleOutput | undefined, never, never>;
    externalWorkspaces: Effect.Effect<Set<string>, never, never>;
}, import("../../../Bundle/Bundle.ts").BundleError | import("effect/PlatformError").PlatformError, import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | import("effect/FileSystem").FileSystem | Path.Path>;
/**
 * The in-process build implementation. ONLY safe inside the dedicated
 * build child (`ViteBuildChildRunner.ts`), whose cwd is the project root
 * and which hosts no concurrent work — never call it from the engine
 * process (see {@link viteBuild}).
 */
export declare const viteBuildInProcess: (rootDir: string, env: Record<string, unknown>, pluginOptions: CloudflareVitePluginOptions) => Effect.Effect<ViteBuildOutput, never, import("effect/FileSystem").FileSystem | Path.Path>;
/**
 * Hash the vite project's input tree (root + workspaces + lockfiles) —
 * the rebuild-free change signal for the `input` hash slot.
 */
export declare const hashViteInput: <E, R>(rootDir: string | undefined, options: (MemoOptions & {
    workspaces?: "auto" | Array<MemoOptions & {
        cwd: string;
    }>;
}) | undefined, additionalWorkspaces: Effect.Effect<Iterable<string>, E, R>) => Effect.Effect<{
    hash: string;
    workspaces: undefined;
} | {
    hash: string;
    workspaces: string[];
}, E | import("effect/PlatformError").PlatformError, R | import("effect/FileSystem").FileSystem | Path.Path>;
/**
 * Source provider for vite-based workers (`props.vite`, set by
 * `Website.Vite`): the vite builder produces the client assets and the
 * server bundle in one pass; diff never builds — the `input` hash over
 * the project tree is the change signal.
 *
 * This module is the lazy-import boundary for the vite toolchain (see
 * the module note above): the dispatch in `Source.ts` dynamically
 * imports it, so its ~0.5s module cost is only paid for vite-based
 * workers.
 */
export declare const makeViteSource: (vite: ViteOptions) => SourceProvider;
//# sourceMappingURL=Vite.d.ts.map