import type { SourceProvider } from "../Source.ts";
/**
 * Source provider for `props.script` workers: the raw module source is
 * uploaded as a single ESM module (`main.js`), bypassing bundling
 * entirely. The bundle hash is `sha256(script)` — identical to the
 * pre-SourceProvider `hashScript` slot, so persisted state diffs cleanly
 * across the refactor.
 */
export declare const makeInlineScriptSource: (script: string) => SourceProvider;
//# sourceMappingURL=InlineScript.d.ts.map