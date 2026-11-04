import type * as rolldown from "rolldown";
/**
 * Default packages whose modules will receive `/*#__PURE__*\/` annotations.
 * Mirrors what `effect-smol` ships via `babel-plugin-annotate-pure-calls`
 * applied to its own `dist/` output.
 *
 * `alchemy` is included so its own resources (which consist almost entirely
 * of `Effect.fn(...)`, `Context.Service(...)(...)`, `Layer.effect(...)` and
 * `Data.TaggedError(...)` top-level calls) become tree-shakeable. The
 * package already declares `"sideEffects": false`, so it is safe.
 *
 * `@distilled.cloud/*` is included so the generated SDK service modules
 * (large files of top-level `const op = make(...)` operation definitions)
 * tree-shake down to the operations a Worker actually calls. Every
 * distilled package declares `"sideEffects": false`.
 */
export declare const DEFAULT_PURE_PACKAGES: ReadonlyArray<string>;
/**
 * Options for {@link purePlugin}.
 */
export interface PurePluginOptions {
    /**
     * Extra package names or globs to annotate, in addition to
     * {@link DEFAULT_PURE_PACKAGES}. Globs are matched with picomatch
     * against the package name (e.g. `effect`, `@effect/cluster`).
     *
     * Listing a package that declares `"sideEffects": false` (or `[]`)
     * in its `package.json` opts it into full annotation, including
     * top-level calls whose result is discarded — see {@link purePlugin}.
     */
    readonly packages?: ReadonlyArray<string>;
    /**
     * If true, the configured `packages` list replaces the defaults
     * entirely instead of extending them.
     * @default false
     */
    readonly replaceDefaults?: boolean;
    /**
     * If true, also marks matched modules as side-effect free
     * (mirrors `"sideEffects": []` in package.json), so rolldown drops
     * unused re-exports from those packages.
     * @default true
     */
    readonly markSideEffectFree?: boolean;
}
/**
 * Rolldown plugin that injects `/*#__PURE__*\/` annotations on top-level
 * call/new expressions of modules belonging to the configured packages,
 * enabling tree-shaking of `effect`, `@effect/*`, and any user-listed
 * packages without requiring a babel post-build pass.
 *
 * Annotation is strictly explicit: only {@link DEFAULT_PURE_PACKAGES} and
 * packages listed via `packages` are touched. Listing a package that
 * declares `sideEffects: false` / `[]` is a deliberate opt-in to full
 * annotation, including discarded-result statement calls (#949). The
 * package owning the bundle entry gets no special treatment — apps that
 * want their own bound calls tree-shaken list themselves explicitly.
 */
export declare const purePlugin: (options?: PurePluginOptions) => rolldown.Plugin;
/**
 * Metadata extracted from a `package.json`. `name` may be `null` when the
 * file exists but has no `"name"` field (rare, but possible for private
 * subpackage roots).
 */
export interface PackageInfo {
    readonly name: string | null;
    readonly sideEffects: unknown;
}
/**
 * Resolves the owning {@link PackageInfo} for a directory by walking up
 * to the nearest `package.json`. This is what makes the plugin work for
 * workspace-linked sources (e.g. our own `packages/alchemy/src/**` when
 * consumers import via the `worker`/`bun` conditions which resolve to
 * `.ts`).
 *
 * Caches both positive and negative results per directory. Every visited
 * directory is a descendant-or-self of the directory where the walk
 * stops (found `package.json`, cache hit, `node_modules` boundary, or
 * filesystem root), so backfilling all of them with the result never
 * poisons sibling packages.
 */
export declare function resolvePackageInfo(startDir: string, cache: Map<string, PackageInfo | null>): Promise<PackageInfo | null>;
/**
 * Extracts the npm package name from a resolved module id by walking back to
 * the last `node_modules/` segment. Handles scoped packages. This is the
 * fast path that does not hit the filesystem; it works for ordinary
 * `node_modules/<pkg>/...` ids but NOT for workspace-linked sources whose
 * resolved path is e.g. `<repo>/packages/alchemy/src/Bundle/PurePlugin.ts`.
 *
 * @example
 *   packageNameFromId("/proj/node_modules/effect/dist/Effect.js")
 *     // => "effect"
 *   packageNameFromId("/proj/node_modules/@effect/cluster/dist/index.js")
 *     // => "@effect/cluster"
 */
export declare function packageNameFromId(id: string): string | null;
/**
 * Offsets at which `/*#__PURE__*\/` may be inserted, split by whether the
 * call's result is consumed.
 */
export interface PureAnchors {
    /**
     * Calls whose result is bound — variable initializers, exports,
     * assignment right-hand sides. Annotating these only lets the minifier
     * drop the call when the binding itself is unused, so it is safe for
     * any module.
     */
    readonly bound: number[];
    /**
     * Top-level calls whose result is discarded (bare expression
     * statements such as `app.get("/", handler)`). Annotating these tells
     * the minifier the whole statement is deletable, so they are only safe
     * in packages that explicitly declare `sideEffects: false` / `[]`.
     */
    readonly discarded: number[];
}
/**
 * Parses `code` and returns the offsets at which `/*#__PURE__*\/` must be
 * inserted — before every top-level `CallExpression` callee / `new`
 * keyword — classified by whether the call result is bound or discarded.
 * Returns `null` if the file does not need to be modified (parse failure
 * or no annotations needed).
 */
export declare function collectPureAnchors(code: string, filename: string): Promise<PureAnchors | null>;
//# sourceMappingURL=PurePlugin.d.ts.map