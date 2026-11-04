import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as crypto from "node:crypto";
import { bundleSource } from "./shared.js";
/**
 * Source provider for `props.script` workers: the raw module source is
 * uploaded as a single ESM module (`main.js`), bypassing bundling
 * entirely. The bundle hash is `sha256(script)` — identical to the
 * pre-SourceProvider `hashScript` slot, so persisted state diffs cleanly
 * across the refactor.
 */
export const makeInlineScriptSource = (script) => {
    const bundle = Effect.sync(() => crypto.createHash("sha256").update(script).digest("hex")).pipe(Effect.map((hash) => ({
        files: [{ path: "main.js", content: script, hash }],
        hash,
    })));
    return bundleSource({
        build: () => bundle,
        // Local dev: a single-element stream — script changes arrive as new
        // props, which restart the instance via `structuralSignature`.
        watch: () => bundle.pipe(Effect.map((output) => Stream.make({ _tag: "Success", output }))),
    });
};
//# sourceMappingURL=InlineScript.js.map