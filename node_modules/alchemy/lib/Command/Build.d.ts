import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import { CommandExecutor, type CommandRunProps } from "./Command.ts";
import { type MemoOptions } from "./Memo.ts";
export interface BuildProps extends CommandRunProps {
    /**
     * The output path (file or directory) produced by the build.
     * This path is relative to the working directory.
     * @example "dist"
     */
    outdir: string;
    /**
     * Controls which files are hashed to decide whether the build should re-run.
     * By default every non-gitignored file in `cwd` is hashed, plus the nearest
     * lockfile. Provide explicit globs to narrow the scope, or set `false` to
     * disable memoization and rebuild on every deploy.
     *
     * @see {@link MemoOptions}
     * @default true
     */
    memo?: MemoOptions | boolean;
}
export interface Build extends Resource<"Command.Build", BuildProps, {
    /**
     * Path to the build output, relative to the process's initial working
     * directory (`initialCwd` — captured at startup, immune to transient
     * chdir by tools sharing the process).
     *
     * Stored relative (rather than absolute) so the value is portable across
     * machines — state written by a CI runner
     * (`/home/runner/work/.../dist`) resolves correctly on a local laptop and
     * vice versa. Consumers should resolve it against `initialCwd` to obtain
     * an absolute path.
     */
    outdir: string;
    hash: {
        /**
         * Hash of the input files that produced this build.
         */
        input: string | undefined;
        /**
         * Hash of the output files from this build.
         */
        output: string | undefined;
    };
}> {
}
/**
 * A `Build` runs a shell command that produces an output asset (a file or
 * directory) and tracks that asset in state. Unlike `Exec`, a `Build` has an
 * output contract: `reconcile` verifies the command actually produced `outdir`
 * and exposes its location so downstream resources (e.g. a `Cloudflare.Worker`'s
 * static assets) can consume it.
 *
 * Inputs are content-hashed by default so an unchanged project skips the
 * rebuild entirely; set `memo: false` to rebuild on every deploy.
 *
 * ### Building a Vite App
 * **Example:** Basic Vite Build
 * ```typescript
 * const build = yield* Build("vite-build", {
 *   command: "npm run build",
 *   cwd: "./frontend",
 *   outdir: "dist",
 * });
 * yield* Console.log(build.outdir); // path to the dist directory, relative to the initial cwd
 * yield* Console.log(build.hash.output); // hash of the output files (when memo is enabled)
 * ```
 *
 * ### Building with Custom Environment
 * **Example:** Build with Environment Variables
 * ```typescript
 * const build = yield* Build("production-build", {
 *   command: "npm run build",
 *   cwd: "./app",
 *   outdir: "dist",
 *   env: {
 *     NODE_ENV: "production",
 *     API_URL: "https://api.example.com",
 *   },
 * });
 * ```
 *
 * ### Customizing Memoization
 * **Example:** Customize Memoization
 * ```typescript
 * const build = yield* Build("custom-build", {
 *   command: "npm run build",
 *   cwd: "./app",
 *   outdir: "dist",
 *   memo: { include: ["src/**", "package.json"], exclude: ["node_modules", "dist"] },
 * });
 * ```
 *
 * @resource
 */
export declare const Build: import("../Resource.ts").ResourceClass<Build>;
export declare const BuildProvider: () => import("effect/Layer").Layer<Provider.Provider<Build>, never, CommandExecutor | FileSystem.FileSystem | Path.Path>;
//# sourceMappingURL=Build.d.ts.map