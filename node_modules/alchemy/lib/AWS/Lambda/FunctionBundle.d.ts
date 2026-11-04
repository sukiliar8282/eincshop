/** @effect-diagnostics anyUnknownInErrorContext:off */
/**
 * The Lambda Function code-bundling machinery, extracted from the live
 * provider closure so it is reusable outside `FunctionProvider` — the floci
 * local provider's watch loop rebuilds the exact same artifact on file
 * change (see [FlociFunctionProvider](./FlociFunctionProvider.ts)).
 *
 * `makeFunctionBundler` resolves the platform services once and returns the
 * same `bundleCode(id, props)` the live provider always used, plus the
 * split-out pieces (`resolveBundlePlan` / `finishBundle` / `prebuiltCode`)
 * that let a watcher run `Bundle.watch` with the identical rolldown config
 * and post-process each incremental output into a deployable archive.
 */
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import type * as rolldown from "rolldown";
import * as Bundle from "../../Bundle/Bundle.ts";
import type { FunctionArchitecture, FunctionZipProps } from "./Function.ts";
/**
 * Evaluates a user-supplied Rolldown `external` option (string, RegExp, array,
 * or predicate) for a single module id, preserving its original semantics.
 */
export declare const matchesConfiguredExternal: (external: rolldown.InputOptions["external"], moduleId: string, parentId: string | undefined, isResolved: boolean) => boolean;
/**
 * The resolved rolldown configuration for a `bundle: true` Function — the
 * exact input/output options `bundleCode` hands to `Bundle.build`, reusable
 * verbatim with `Bundle.watch` for incremental dev rebuilds, plus the
 * post-processing inputs `finishBundle` needs.
 */
export interface FunctionBundlePlan {
    readonly inputOptions: rolldown.InputOptions;
    readonly outputOptions: rolldown.OutputOptions;
    readonly extra: Bundle.BundleExtraOptions | undefined;
    readonly cwd: string;
    readonly requested: Record<string, string>;
    readonly sourcemap: boolean | "inline" | "hidden";
    readonly uploadSourceMap: boolean;
    readonly architecture: FunctionArchitecture;
}
export interface FunctionBundleResult {
    /** Identity hash driving change detection in `diff` / watch dedupe. */
    readonly identityHash: string;
    /** Deferred archive build (performs native-package installs). */
    readonly buildArchive: Effect.Effect<{
        archive: Uint8Array<ArrayBufferLike>;
        archiveHash: string;
    }, any, any>;
}
export declare const makeFunctionBundler: Effect.Effect<{
    bundleCode: (id: string, props: FunctionZipProps) => Effect.Effect<FunctionBundleResult, any, any>;
    prebuiltCode: (realMain: string) => Effect.Effect<FunctionBundleResult, any, any>;
    resolveBundlePlan: (props: FunctionZipProps) => Effect.Effect<FunctionBundlePlan, any, any>;
    finishBundle: (plan: FunctionBundlePlan, bundleOutput: Bundle.BundleOutput) => Effect.Effect<FunctionBundleResult, any, any>;
}, never, FileSystem.FileSystem | import("effect/Path").Path>;
//# sourceMappingURL=FunctionBundle.d.ts.map