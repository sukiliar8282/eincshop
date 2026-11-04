import type * as rolldown from "rolldown";
/**
 * Matches `?raw` or `&raw` query suffixes, mirroring Vite's `rawRE`
 * (see `vite/src/node/utils.ts`). Used to gate both `resolveId` and
 * `load` so the plugin only inspects ids that opt in.
 */
export declare const RAW_RE: RegExp;
/**
 * Rolldown plugin that adds Vite-style `?raw` import support to the
 * Alchemy bundler.
 *
 * Importing a file with the `?raw` suffix inlines its contents as the
 * default export of a JS module:
 *
 * ```ts
 * import sql from "./schema.sql?raw";
 * //         ^ string — the file contents read as UTF-8
 * ```
 *
 * This plugin only implements `?raw`. Vite's `?url` and `?inline`
 * variants both rely on a browser asset pipeline (URL serving / `data:`
 * fallback) that has no analogue in the server-side bundles produced
 * here (Cloudflare Workers, AWS Lambda), so they are intentionally
 * omitted.
 */
export declare const rawPlugin: () => rolldown.Plugin;
/**
 * Splits an id into its file portion and the query/hash postfix (kept
 * with the leading `?` / `#`). Matches Vite's `splitFileAndPostfix`.
 *
 * @example
 *   splitFileAndPostfix("./foo.txt?raw") // => ["./foo.txt", "?raw"]
 *   splitFileAndPostfix("./foo.txt")     // => ["./foo.txt", ""]
 */
export declare function splitFileAndPostfix(id: string): [string, string];
//# sourceMappingURL=RawPlugin.d.ts.map