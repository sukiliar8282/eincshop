import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Provider from "./Provider.js";
import { Resource } from "./Resource.js";
export const makeRandom = (id, props) => Random(id, props).pipe(Effect.map((rand) => rand.text));
/**
 * A deterministic-in-state random secret generator.
 *
 * The value is generated once on create and then persisted in state so
 * subsequent deploys keep the same secret unless the resource is replaced.
 */
export const Random = Resource("Alchemy.Random");
export const RandomProvider = () => Provider.succeed(Random, {
    reconcile: ({ news = {}, output }) => Effect.sync(() => {
        // Observe — there is no remote state. The cached `output.text` is
        // the authoritative current value; once minted it is preserved
        // across reconciles to keep the secret stable.
        if (output?.text) {
            return output;
        }
        // Ensure — no observed value: mint a fresh random secret and
        // return it. The next reconcile will see this in `output` and
        // short-circuit above.
        const byteLength = news.bytes ?? 32;
        const bytes = new Uint8Array(byteLength);
        crypto.getRandomValues(bytes);
        return {
            text: Redacted.make(Array.from(bytes)
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("")),
        };
    }),
    delete: () => Effect.void,
    read: ({ output }) => Effect.succeed(output),
    // Non-listable: the value is generated client-side with
    // `crypto.getRandomValues` and lives only in alchemy state. There is no
    // remote service to enumerate, so listing yields nothing.
    list: () => Effect.succeed([]),
});
//# sourceMappingURL=Random.js.map