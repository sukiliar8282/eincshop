import * as Effect from "effect/Effect";
import { State } from "./State.js";
import { allStages } from "./Tree.js";
/**
 * Read every resource record in scope from the state store as one
 * document.
 *
 * Fans out over every `(stack, stage)` the store holds — see
 * {@link allStages} — with the per-resource reads bounded, so a whole
 * estate is fetched in a single pass instead of a call per resource.
 * Records that disappear between `list` and `get` (a concurrent
 * deploy/destroy) are skipped rather than failing the export.
 *
 * Results are ordered deterministically: by stack, then stage, then
 * FQN.
 */
export const exportState = Effect.fn("exportState")(function* (filter = {}) {
    const state = yield* yield* State;
    const perStage = yield* Effect.forEach(yield* allStages(filter), ({ stack, stage }) => Effect.gen(function* () {
        const fqns = [...(yield* state.list({ stack, stage }))].sort();
        const records = yield* Effect.forEach(fqns, (fqn) => Effect.map(state.get({ stack, stage, fqn }), (value) => value === undefined
            ? undefined
            : { stack, stage, fqn, state: value }), { concurrency: 16 });
        return records.filter((r) => r !== undefined);
    }), { concurrency: "unbounded" });
    return { resources: perStage.flat() };
});
//# sourceMappingURL=Export.js.map