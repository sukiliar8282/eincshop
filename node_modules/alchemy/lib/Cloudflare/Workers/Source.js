var __rewriteRelativeImportExtension = (this && this.__rewriteRelativeImportExtension) || function (path, preserveJsx) {
    if (typeof path === "string" && /^\.\.?\//.test(path)) {
        return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function (m, tsx, d, ext, cm) {
            return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : (d + ext + "." + cm.toLowerCase() + "js");
        });
    }
    return path;
};
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import { getToolingCompatibility } from "./Compatibility.js";
import { makeInlineScriptSource } from "./Sources/InlineScript.js";
import { makePrebuiltSource } from "./Sources/Prebuilt.js";
import { isPythonMain, makePythonSource } from "./Sources/Python.js";
import { makeRolldownSource } from "./Sources/Rolldown.js";
/**
 * An error raised by an external source provider, wrapped at the load
 * boundary so the WorkerProvider's lifecycle error union stays closed.
 */
export class SourceProviderError extends Data.TaggedError("Cloudflare.Workers.SourceProviderError") {
}
/**
 * Validated provider modules memoized per specifier for the process
 * lifetime — a Worker resolves its source at least twice per deploy
 * (diff, then reconcile). `make(options)` still runs per resolution: a
 * stack can host several Workers of the same provider with different
 * options.
 */
const sourceModules = new Map();
const importSourceModule = (specifier) => Effect.suspend(() => {
    const cached = sourceModules.get(specifier);
    if (cached) {
        return Effect.succeed(cached);
    }
    return Effect.tryPromise({
        try: () => import(__rewriteRelativeImportExtension(/* @vite-ignore */ specifier)),
        catch: (cause) => new SourceProviderError({
            provider: specifier,
            message: `Failed to import Worker source provider "${specifier}". ` +
                `Is the package installed in your project? Install it and re-run.`,
            cause,
        }),
    }).pipe(Effect.flatMap((mod) => {
        if (typeof mod.default?.make !== "function") {
            return Effect.fail(new SourceProviderError({
                provider: specifier,
                message: `Module "${specifier}" is not a Worker source provider: ` +
                    `its default export must satisfy WorkerSourceModule ({ make(options) }).`,
            }));
        }
        const module = mod.default;
        sourceModules.set(specifier, module);
        return Effect.succeed(module);
    }));
});
/**
 * Load an external source provider from its serializable descriptor:
 * dynamically import the module, validate the shape, and call
 * `make(options)`.
 */
export const loadSource = (descriptor) => importSourceModule(descriptor.provider).pipe(Effect.flatMap((mod) => mod.make(descriptor.options)));
/**
 * Resolve the {@link SourceProvider} for a Worker from its props. The
 * `source` descriptor (external providers) wins; legacy props map to the
 * built-in providers, preserving the historical precedence exactly:
 * `script` → `vite` → `.py` main → `bundle: false` → rolldown (default).
 *
 * `source` is mutually exclusive with `script`/`vite`/`main` — a source
 * is self-contained, and a provider that needs a custom entry takes it
 * in its own `options`.
 */
export const resolveSource = (props) => {
    if (props.source) {
        const conflict = props.script !== undefined
            ? "script"
            : props.vite
                ? "vite"
                : props.main !== undefined
                    ? "main"
                    : undefined;
        if (conflict) {
            return Effect.fail(new SourceProviderError({
                provider: props.source.provider,
                message: `Worker prop "source" is mutually exclusive with "${conflict}": ` +
                    `a source provider is self-contained — pass a custom entry via the provider's own options instead.`,
            }));
        }
        return loadSource(props.source);
    }
    if (props.script !== undefined) {
        return Effect.succeed(makeInlineScriptSource(props.script));
    }
    if (props.vite) {
        // Loaded lazily: `./Sources/Vite.ts` pulls in
        // `@alchemy.run/cloudflare-runtime/vite` (~0.5s), which is only
        // needed for vite-based workers — not for every Worker resolution.
        const vite = props.vite;
        return Effect.promise(() => import("./Sources/Vite.js")).pipe(Effect.map((Vite) => Vite.makeViteSource(vite)));
    }
    if (isPythonMain(props.main)) {
        return Effect.succeed(makePythonSource(props.main));
    }
    if (props.bundle === false) {
        return Effect.succeed(makePrebuiltSource({ main: props.main, rules: props.rules }));
    }
    return Effect.succeed(makeRolldownSource({ main: props.main }));
};
/**
 * Derive the shared {@link SourceContext} from a Worker's props. Pure —
 * the physical `workerName` is computed by the caller (it may come from
 * persisted output state rather than the name generator).
 */
export const makeSourceContext = (params) => ({
    id: params.id,
    fqn: params.fqn,
    workerName: params.workerName,
    compatibility: getToolingCompatibility(params.compatibility, params.props.main),
    entry: params.props.isExternal
        ? { kind: "external" }
        : { kind: "effect", exports: params.props.exports ?? {} },
    stack: { name: params.stack.name, stage: params.stack.stage },
    env: params.props.env,
    extraOptions: params.props.build,
    assets: params.props.assets,
});
//# sourceMappingURL=Source.js.map