import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { type ProviderService } from "./Provider.ts";
import type { ProviderMode } from "./ProviderMode.ts";
/** A provider call that failed. These are collected into results, never thrown. */
export interface ProviderFailure {
    readonly provider: string;
    readonly operation: "list" | "delete";
    readonly message: string;
}
/** One cloud object a provider's `list()` turned up, bound to its provider. */
export interface Target {
    readonly providerId: string;
    readonly displayName: string;
    readonly attributes: Record<string, unknown>;
    readonly provider: ProviderService;
}
export interface DiscoverOptions {
    readonly mode: ProviderMode;
    /** Provider-id globs to include. Omitted means every provider. */
    readonly include?: ReadonlyArray<string>;
    /** Provider-id globs to exclude. Applied after {@link DiscoverOptions.include}. */
    readonly exclude?: ReadonlyArray<string>;
}
export interface ListOptions extends DiscoverOptions {
    /** The built provider context — what a stack's `providers` layer produced. */
    readonly context: Context.Context<never>;
    readonly concurrency?: number | "unbounded";
    readonly timeoutSeconds?: number;
    /** Called once with the selected provider count before enumeration starts. */
    readonly onScan?: (total: number) => Effect.Effect<void>;
    /** Called when a provider starts resolving/listing, to identify slow scans. */
    readonly onProviderStarted?: (provider: string) => Effect.Effect<void>;
    /**
     * Called as each provider's listing settles (0 resources when it failed),
     * for progress reporting — scans across many providers are the slowest
     * part of a nuke and would otherwise be silent until the summary.
     */
    readonly onProvider?: (provider: string, resources: number, error?: string) => Effect.Effect<void>;
}
export type Strategy = 
/** Delete in dependency order, retrying a wave until it stops making progress. */
{
    readonly _tag: "coordinated";
}
/** Delete everything at once, retrying each object on its own. */
 | {
    readonly _tag: "independent";
    readonly retries: number;
};
export interface DestroyOptions {
    readonly targets: ReadonlyArray<Target>;
    readonly context: Context.Context<never>;
    readonly strategy: Strategy;
    readonly concurrency?: number | "unbounded";
    readonly timeoutSeconds?: number;
    /** Called before each coordinated pass, or once for independent deletion. */
    readonly onPass?: (pass: number) => Effect.Effect<void>;
    /** Called before each deletion attempt. */
    readonly onDeleting?: (resource: Target) => Effect.Effect<void>;
    /** Called when dependency failures prevent a resource from being attempted. */
    readonly onHeld?: (resource: Target, blockedBy: ReadonlyArray<string>) => Effect.Effect<void>;
    /** Called as each object is confirmed gone, for progress reporting. */
    readonly onDeleted?: (resource: Target) => Effect.Effect<void>;
    /** Called as a deletion attempt fails permanently (the run keeps going). */
    readonly onFailed?: (resource: Target, message: string) => Effect.Effect<void>;
}
export interface Result {
    readonly requested: number;
    readonly deleted: ReadonlyArray<Target>;
    readonly failed: ReadonlyArray<{
        readonly resource: Target;
        readonly failure: ProviderFailure;
    }>;
    /** Skipped because something they depend on could not be deleted first. */
    readonly held: ReadonlyArray<{
        readonly resource: Target;
        readonly blockedBy: ReadonlyArray<string>;
    }>;
    readonly passes: number;
}
/** Ask every selected provider what exists. Provider failures are collected, not thrown. */
export declare const list: (options: ListOptions) => Effect.Effect<{
    readonly resources: ReadonlyArray<Target>;
    readonly failures: ReadonlyArray<ProviderFailure>;
}>;
/** Delete the given targets under the chosen {@link Strategy}. */
export declare const destroy: ({ targets, context, strategy, concurrency, timeoutSeconds, onDeleted, onFailed, onPass, onDeleting, onHeld, }: DestroyOptions) => Effect.Effect<Result>;
//# sourceMappingURL=Nuke.d.ts.map