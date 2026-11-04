import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner";
import type { KubernetesObjectDefinition } from "./objects.ts";
declare const HelmError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "HelmError";
} & Readonly<A>;
/** A Helm invocation or render failure (bad chart ref, template error, …). */
export declare class HelmError extends HelmError_base<{
    readonly message: string;
    readonly cause?: unknown;
}> {
}
export interface RenderHelmChartOptions {
    /**
     * Chart reference: a repository chart name (with `repo`), an
     * `oci://` reference, or a local chart directory path.
     */
    chart: string;
    /** Classic chart repository URL (`--repo`). */
    repo?: string | undefined;
    /** Chart version (`--version`). */
    version?: string | undefined;
    /** Release name the chart's templates render with (`.Release.Name`). */
    releaseName: string;
    /** Namespace the chart renders into (`.Release.Namespace`). */
    namespace: string;
    /** Values passed to the chart (written to a temp values file). */
    values?: Record<string, unknown> | undefined;
    /**
     * Render objects from the chart's `crds/` directory too
     * (`--include-crds`).
     * @default true
     */
    includeCrds?: boolean | undefined;
}
/**
 * Render a chart with `helm template --no-hooks` and parse the
 * multi-document YAML output into object definitions. Every rendered object
 * must carry `apiVersion`, `kind`, and `metadata.name` (server-side apply
 * needs a name; `generateName`-only objects are rejected with a clear
 * error). Helm lifecycle hooks are excluded from the result (see
 * {@link isHelmHook}).
 */
export declare const renderHelmChart: (options: RenderHelmChartOptions) => Effect.Effect<KubernetesObjectDefinition[], HelmError | import("effect/PlatformError").PlatformError, ChildProcessSpawner.ChildProcessSpawner | FileSystem.FileSystem | Path.Path | import("effect/Scope").Scope>;
/**
 * Whether a rendered object is a Helm lifecycle hook (`helm.sh/hook`
 * annotation). Hooks are executed by Helm at release events (pre-install,
 * pre-delete, test, …); HelmChart has no release and no hook lifecycle, so
 * they are filtered out rather than applied as ordinary objects.
 */
export declare const isHelmHook: (object: KubernetesObjectDefinition) => boolean;
/**
 * Parse `helm template` output (multi-document YAML) into definitions.
 * Hook-annotated objects are dropped — `renderHelmChart` already passes
 * `--no-hooks`, but the parser enforces the invariant independently of the
 * helm CLI's behavior.
 */
export declare const parseRenderedManifests: (chart: string, rendered: string) => Effect.Effect<Array<KubernetesObjectDefinition>, HelmError>;
export {};
//# sourceMappingURL=helm.d.ts.map