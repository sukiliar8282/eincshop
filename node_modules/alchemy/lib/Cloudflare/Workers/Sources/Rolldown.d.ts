import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import type * as Path from "effect/Path";
import * as Stream from "effect/Stream";
import type * as rolldown from "rolldown";
import * as Bundle from "../../../Bundle/Bundle.ts";
import { type WorkflowExport } from "../../Workflows/Workflow.ts";
import { type DurableObjectExport } from "../DurableObject.ts";
import type { SourceProvider } from "../Source.ts";
/**
 * Bundler options for a Worker: the generic {@link Bundle.BundleExtraOptions}
 * plus rolldown output overrides merged over Alchemy's defaults.
 */
export interface WorkerBuildOptions extends Bundle.BundleExtraOptions {
    /**
     * Rolldown output options merged over Alchemy's defaults. Use this to
     * control chunking (`codeSplitting`), minification, etc.
     */
    output?: rolldown.OutputOptions;
    /**
     * Forwarded to rolldown's `preserveEntrySignatures` input option. Some
     * `output.codeSplitting` configurations require relaxing it (e.g.
     * `includeDependenciesRecursively: false` needs `"allow-extension"`).
     * Workers must keep their entry exports, so never pass `false`.
     */
    preserveEntrySignatures?: rolldown.InputOptions["preserveEntrySignatures"];
}
export interface WorkerBundleOptions {
    id: string;
    main: string;
    compatibility: {
        date: string;
        flags: string[];
    };
    entry: {
        kind: "external";
    } | {
        kind: "effect";
        exports: Record<string, DurableObjectExport | WorkflowExport>;
    };
    stack: {
        name: string;
        stage: string;
    };
    extraOptions: WorkerBuildOptions | undefined;
}
export declare const WorkerBundle: Effect.Effect<{
    build: (options: WorkerBundleOptions) => Effect.Effect<Bundle.BundleOutput, Bundle.BundleError, never>;
    watch: (options: WorkerBundleOptions) => Stream.Stream<Bundle.BundleWatchEvent, Bundle.BundleError, never>;
}, never, FileSystem.FileSystem | Path.Path>;
export declare const makeEffectVirtualEntry: (exports: Record<string, DurableObjectExport | WorkflowExport>, stack: {
    name: string;
    stage: string;
}) => (importPath: string) => string;
/**
 * The default source provider: bundle `props.main` with rolldown.
 *
 * `hash()` deliberately builds — recomputing "without building" is
 * impossible for rolldown without a source-tree memo hash, and today's
 * semantics accept that. The build routes through `Artifacts.cached`
 * under the same key as `build()`, so a diff that had to build shares
 * its output with the reconcile in the same run.
 */
export declare const makeRolldownSource: (options: {
    main: string;
}) => SourceProvider;
//# sourceMappingURL=Rolldown.d.ts.map