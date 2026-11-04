import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Stream from "effect/Stream";
import * as Bundle from "../../../Bundle/Bundle.ts";
import type { SourceProvider } from "../Source.ts";
/**
 * Whether a Worker `main` entry points at a Python module. Python Workers
 * skip the rolldown pipeline entirely — Cloudflare interprets `.py` sources
 * directly with Pyodide, so the "bundle" is just the source files plus the
 * vendored `python_modules/` directory.
 *
 * The parameter is `unknown` on purpose. `getCompatibility` reaches this from
 * `WorkerProvider.precreate`, which is handed *raw, unresolved* props so
 * resources in a dependency cycle can signal early — and `main` is an
 * `Input`, so it can legitimately be an `Output` there (e.g. an entry path
 * derived from a `Command.Build` output). An unresolved Output is a callable
 * Proxy: it passes a `!== undefined` guard, `.split` yields another proxy,
 * and calling it returns `undefined` — so a value-shaped check explodes with
 * a bare `TypeError`. Narrowing on `typeof === "string"` keeps the predicate
 * total: an unresolved `main` is simply not Python yet, and `reconcile`
 * re-derives compatibility from fully resolved props.
 */
export declare const isPythonMain: (main: unknown) => main is string;
/**
 * The Pyodide cross-compilation targets uv understands, keyed by the Python
 * version the Workers runtime selects from the compatibility date/flags.
 * The wheel index does not have to match the exact Pyodide release the
 * runtime uses — only the ABI (emscripten-wasm32) must be compatible.
 * Mirrors pywrangler (cloudflare/workers-py `pywrangler/utils.py`).
 */
declare const PYODIDE_TARGETS: {
    readonly "3.12": {
        readonly interpreter: "cpython-3.12.7-emscripten-wasm32-musl";
        readonly index: "https://index.pyodide.org/0.27.7";
    };
    readonly "3.13": {
        readonly interpreter: "cpython-3.13.2-emscripten-wasm32-musl";
        readonly index: "https://index.pyodide.org/0.28.3";
    };
};
/**
 * The Python version the Workers runtime will use for the given
 * compatibility settings — the same selection pywrangler performs.
 */
export declare const pythonVersionForCompatibility: (compatibility: {
    date: string;
    flags: string[];
}) => keyof typeof PYODIDE_TARGETS;
export interface PythonWorkerBundleOptions {
    id: string;
    /** Namespace-qualified id — the display prefix for log lines. */
    fqn: string;
    /** Path (or `file://` URL) to the Worker's `.py` entry module. */
    main: string;
    compatibility: {
        date: string;
        flags: string[];
    };
}
/**
 * Read a Python Worker "bundle" from disk. There is no compilation step —
 * the output is:
 *
 * 1. the entry module (first, so it becomes `main_module`), then every
 *    other `.py` file under the entry's directory, read as text;
 * 2. every file of the resolved `python_modules/` directory (vendored
 *    wheels), read as bytes and named `python_modules/<relpath>` —
 *    Wrangler's vendored-module layout, which both the upload API and
 *    workerd resolve at runtime.
 */
export declare const readPythonWorkerBundle: (options: PythonWorkerBundleOptions) => Effect.Effect<Bundle.BundleOutput, Bundle.BundleError, import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | FileSystem.FileSystem | import("effect/Scope").Scope>;
/**
 * Watch a Python Worker for changes: emits the initial build, then
 * rebuilds whenever a file under the entry's directory changes (debounced).
 * Mirrors the {@link Bundle.BundleWatchEvent} protocol of the rolldown
 * watcher so local dev can consume either stream interchangeably.
 */
export declare const watchPythonWorkerBundle: (options: PythonWorkerBundleOptions) => Stream.Stream<Bundle.BundleWatchEvent, never, import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | FileSystem.FileSystem | import("effect/Scope").Scope>;
/**
 * Source provider for Python workers (`.py` entry): no bundling — the
 * entry plus sibling `.py` files upload as Python modules with
 * dependencies vendored via uv. The read is cached per run under the
 * shared `"build"` artifact key so diff and reconcile vendor once.
 */
export declare const makePythonSource: (main: string) => SourceProvider;
export {};
//# sourceMappingURL=Python.d.ts.map