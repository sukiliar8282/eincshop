import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import type { PlatformError } from "effect/PlatformError";
import type * as vite from "vite";
import { BundleError, type BundleOutput } from "./Bundle.ts";
export interface ViteBuildOutput {
    readonly clientDirectory: string | undefined;
    /**
     * The client environment's resolved Vite `base`. The build rewrites
     * every emitted asset URL with it, so the uploaded asset manifest must
     * be keyed with the same prefix to agree with the HTML.
     */
    readonly base: string | undefined;
    readonly serverBundle: Effect.Effect<BundleOutput | undefined, BundleError>;
    readonly externalWorkspaces: Effect.Effect<Set<string>, PlatformError>;
}
/**
 * A Vite plugin that collects the output of the build and makes it available as an Effect.
 * @param entryEnvironment - The environment to use as the entry point for the server bundle. Defaults to "ssr".
 */
export declare const viteBuildOutputPlugin: (args_0: {
    entryEnvironment?: string;
}) => Effect.Effect<{
    plugin: vite.Plugin<any>;
    output: Effect.Effect<ViteBuildOutput, never, never>;
}, never, FileSystem.FileSystem | Path.Path>;
//# sourceMappingURL=Vite.d.ts.map