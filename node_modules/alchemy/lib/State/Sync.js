import * as Effect from "effect/Effect";
import {} from "./State.js";
/**
 * Synchronize all state (every stack/stage/resource) from `source` into
 * `destination` so that `destination` becomes a mirror of `source`.
 *
 * For each `{ stack, stage, fqn }` present in `source`, the resource is
 * written into `destination`, overwriting any existing entry under the same
 * key. Any keys present in `destination` but absent from `source` are
 * deleted, ensuring the two stores end up structurally identical.
 *
 * Stacks are walked sequentially; stages within a stack and resources
 * within a stage are processed concurrently for throughput.
 */
export const syncState = Effect.fn(function* (source, destination, options) {
    const concurrency = options?.concurrency ?? "unbounded";
    const [sourceStacks, destStacks] = yield* Effect.all([
        source.listStacks(),
        destination.listStacks(),
    ]);
    const sourceStackSet = new Set(sourceStacks.filter((stack) => options?.stacks?.includes(stack) ?? true));
    yield* Effect.forEach(sourceStacks, Effect.fn(function* (stack) {
        const [sourceStages, destStages] = yield* Effect.all([
            source.listStages(stack),
            destination.listStages(stack),
        ]);
        const stages = union(sourceStages, destStages);
        yield* Effect.forEach(stages, Effect.fn(function* (stage) {
            const sourceFqns = yield* source.list({ stack, stage });
            const destFqns = yield* destination.list({ stack, stage });
            const sourceSet = new Set(sourceFqns);
            const toDelete = destFqns.filter((fqn) => !sourceSet.has(fqn));
            yield* Effect.all([
                Effect.forEach(sourceFqns, Effect.fn(function* (fqn) {
                    const value = yield* source.get({ stack, stage, fqn });
                    if (value) {
                        yield* destination.set({ stack, stage, fqn, value });
                    }
                }), { concurrency }),
                Effect.forEach(toDelete, (fqn) => destination.delete({ stack, stage, fqn }), { concurrency }),
            ], { concurrency: "unbounded" });
        }), { concurrency: "unbounded" });
    }));
    yield* Effect.forEach(destStacks.filter((stack) => !sourceStackSet.has(stack)), (stack) => destination.deleteStack({ stack }));
});
const union = (left, right) => [
    ...new Set([...left, ...right]),
];
//# sourceMappingURL=Sync.js.map