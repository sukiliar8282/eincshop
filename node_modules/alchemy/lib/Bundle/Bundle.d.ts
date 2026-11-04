import * as Effect from "effect/Effect";
import * as Path from "effect/Path";
import * as Schema from "effect/Schema";
import * as Stream from "effect/Stream";
import type * as rolldown from "rolldown";
import { type BundleAnalyzerPluginOptions } from "./BundleAnalyzerPlugin.ts";
import { type PurePluginOptions } from "./PurePlugin.ts";
/**
 * `resolve.conditionNames` for a bundle that runs on bun / node.
 *
 * Rolldown's DEFAULT conditions are import-kind specific: `import` for
 * `import` statements and `require` for `require()` calls. An explicit
 * `conditionNames` list is applied as one set to BOTH kinds, and rolldown
 * adds only the current kind on top. Listing `"import"` here therefore
 * made every `require()` also match a package's `"import"` export — and
 * `exports` maps are matched in the PACKAGE's key order, so for `pg-pool`
 * (`{ import, require }`) a `require("pg-pool")` received the ESM namespace
 * and `pg` died with `TypeError: The superclass is not a constructor`.
 *
 * So: never put `import` or `require` in these lists. Only the runtime
 * condition and the kind-agnostic ones; rolldown supplies the kind.
 */
export declare const BUN_CONDITION_NAMES: readonly string[];
export declare const NODE_CONDITION_NAMES: readonly string[];
/**
 * Extra options accepted by {@link build} / {@link watch} on top of the
 * standard rolldown input/output options.
 */
export interface BundleExtraOptions {
    /**
     * Configures the {@link purePlugin} which annotates top-level
     * call/new expressions in matching packages with `/*#__PURE__*\/`
     * so rolldown can tree-shake them.
     *
     * - `undefined` (default): plugin is enabled with the default packages
     *   (`effect`, `@effect/*`, `alchemy`, `@alchemy.run/*`,
     *   `@distilled.cloud/*` — see `DEFAULT_PURE_PACKAGES`).
     * - `PurePluginOptions`: plugin is enabled with the provided options.
     *   `packages` extends the defaults; set `replaceDefaults: true` to
     *   replace them instead.
     * - `false`: plugin is disabled.
     */
    readonly pure?: PurePluginOptions | false;
    /**
     * Configures the {@link bundleAnalyzerPlugin} which emits a bundle analysis
     * report alongside the bundle output, describing chunks, modules, and the
     * import graph reachable from each entry point.
     *
     * - `undefined` / `false` (default): plugin is disabled.
     * - `true`: plugin is enabled with default options.
     * - `BundleAnalyzerPluginOptions`: plugin is enabled with the provided options.
     */
    readonly bundleAnalyzer?: BundleAnalyzerPluginOptions | boolean;
}
/**
 * The user-facing bundler configuration shared by every resource that
 * bundles an entrypoint with rolldown (AWS Lambda Function, Batch
 * JobDefinition, App Runner Service, ECR image sources, EC2 hosted
 * instances, Docker service images, Cloudflare container images, …):
 * rolldown input/output overrides plus the {@link BundleExtraOptions}
 * (pure-annotation packages via `pure`, bundle analyzer).
 *
 * Unused code is tree-shaken. `effect`, alchemy, and `@distilled.cloud`
 * are marked pure so unused parts prune more aggressively. List extra
 * packages with `pure.packages`, or disable with `pure: false`.
 */
export interface BundleConfig extends BundleExtraOptions {
    /**
     * Rolldown input options overrides.
     */
    readonly input?: Partial<rolldown.InputOptions>;
    /**
     * Rolldown output options overrides.
     */
    readonly output?: Partial<rolldown.OutputOptions>;
}
export interface BundleOutput {
    /**
     * The files in the bundle.
     * The first file is the entry.
     */
    readonly files: [BundleFile, ...BundleFile[]];
    /**
     * The SHA-256 hash of all files in the bundle.
     */
    readonly hash: string;
}
export interface BundleFile {
    readonly path: string;
    readonly content: string | Uint8Array<ArrayBufferLike>;
    readonly hash: string;
}
declare const BundleError_base: Schema.Class<BundleError, Schema.TaggedStruct<"BundleError", {
    readonly message: Schema.String;
    readonly cause: Schema.optional<Schema.Defect>;
}>, import("effect/Cause").YieldableError>;
export declare class BundleError extends BundleError_base {
}
export type BundleWatchEvent = BundleWatchEvent.Start | BundleWatchEvent.Success | BundleWatchEvent.Error;
export declare namespace BundleWatchEvent {
    interface Start {
        readonly _tag: "Start";
    }
    interface Success {
        readonly _tag: "Success";
        readonly output: BundleOutput;
    }
    interface Error {
        readonly _tag: "Error";
        readonly error: BundleError;
    }
}
/**
 * Build a bundle using rolldown from the given input options and output options.
 * @param inputOptions - The input options for the bundle.
 * @param outputOptions - The output options for the bundle.
 * @returns The bundle output.
 */
export declare const build: (inputOptions: rolldown.InputOptions, outputOptions?: rolldown.OutputOptions, extra?: BundleExtraOptions) => Effect.Effect<BundleOutput, BundleError>;
/**
 * Watch for changes in the bundle and return a stream of bundle output.
 * @param inputOptions - The input options for the bundle.
 * @param outputOptions - The output options for the bundle.
 * @returns A stream of Result instances containing either the bundle output or an error.
 */
export declare const watch: (inputOptions: rolldown.InputOptions, outputOptions?: rolldown.OutputOptions, extra?: BundleExtraOptions) => Stream.Stream<BundleWatchEvent>;
export declare const virtualEntryPlugin: Effect.Effect<(content: (importPath: string) => string) => {
    name: string;
    options: {
        order: "pre";
        handler(this: rolldown.MinimalPluginContext, inputOptions: rolldown.InputOptions): undefined;
    };
    resolveId: {
        filter: {
            id: RegExp;
        };
        handler(this: rolldown.PluginContext, id: string, importer: string | undefined): Promise<rolldown.ResolvedId | {
            id: string;
        } | null>;
    };
    load: {
        filter: {
            id: RegExp;
        };
        handler(this: rolldown.PluginContext, id: string): {
            code: string;
            moduleType: "ts";
        };
    };
}, never, Path.Path>;
export declare function bundleOutputFromRolldownOutputBundle(bundle: rolldown.OutputBundle): Effect.Effect<BundleOutput, BundleError>;
export declare function bundleErrorFromUnknown(error: unknown): BundleError;
export declare function bundleOutputFromFiles(files: [BundleFile, ...BundleFile[]]): Effect.Effect<BundleOutput>;
export {};
//# sourceMappingURL=Bundle.d.ts.map