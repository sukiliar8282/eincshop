import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Stream from "effect/Stream";
import type * as Bundle from "../../../Bundle/Bundle.ts";
import type { DevContext, SourceContext, SourceError, SourceProvider, SourceServices } from "../Source.ts";
/**
 * Convert a Worker `main` entry (a plain path or a `file://` URL) to a
 * filesystem path, without resolving it.
 *
 * Internal to `Workers/Sources/` — not exported from the package index.
 */
export declare const mainToPath: (main: string) => Effect.Effect<string, never, never>;
/**
 * Resolve a Worker `main` entry (path or `file://` URL) to an absolute
 * path without following symlinks (Alchemy v1 parity): the module walk
 * happens in the directory the user pointed at, not the entry's
 * canonical location.
 *
 * Deliberately distinct from `Bundle/TempRoot.ts`'s same-named helper,
 * which canonicalizes through `fs.realPath` — the rolldown bundler wants
 * the real path, the byte-for-byte readers (python, prebuilt) do not.
 *
 * Internal to `Workers/Sources/` — not exported from the package index.
 */
export declare const resolveMainPath: (main: string) => Effect.Effect<string, never, never>;
/**
 * A {@link SourceProvider} that only produces a server bundle: no static
 * assets, and `bundle` as its single hash slot. Every built-in source
 * except vite has this shape — they differ only in how they produce the
 * bundle and how they watch it for local dev.
 *
 * `build` is used for both `build()` and `hash()`; implementations that
 * are expensive route it through `Artifacts.cached` so diff and reconcile
 * build once per run.
 *
 * Internal to `Workers/Sources/` — not exported from the package index.
 */
export declare const bundleSource: (spec: {
    readonly build: (ctx: SourceContext) => Effect.Effect<Bundle.BundleOutput, SourceError, SourceServices>;
    readonly watch: (ctx: DevContext) => Effect.Effect<Stream.Stream<Bundle.BundleWatchEvent, SourceError, any>, SourceError, any>;
}) => SourceProvider;
/**
 * Watch the directory containing a Worker's entry module and re-read the
 * bundle on change (debounced), emitting the
 * {@link Bundle.BundleWatchEvent} protocol the rolldown watcher speaks so
 * local dev consumes either stream interchangeably.
 *
 * Used by the sources that read their bundle byte-for-byte off disk
 * (python, prebuilt) rather than bundling it — the re-read never goes
 * through rolldown, preserving their byte-for-byte contract.
 *
 * Internal to `Workers/Sources/` — not exported from the package index.
 */
export declare const watchBundleDirectory: <R>(options: {
    readonly main: string;
    readonly read: Effect.Effect<Bundle.BundleOutput, Bundle.BundleError, R>;
    /** Paths for which a change should NOT trigger a re-read. */
    readonly ignore?: (path: string) => boolean;
}) => Stream.Stream<Bundle.BundleWatchEvent, never, R | FileSystem.FileSystem>;
//# sourceMappingURL=shared.d.ts.map