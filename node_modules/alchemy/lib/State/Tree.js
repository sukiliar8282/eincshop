import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import { State } from "./State.js";
import { encodeState } from "./StateEncoding.js";
/** The path does not exist, or does not support the requested operation. */
export class InvalidStatePath extends Data.TaggedError("InvalidStatePath") {
}
/**
 * Every `(stack, stage)` pair the store holds, or the subset a filter pins.
 *
 * Enumerating them means `listStacks` then a `listStages` per stack, so the
 * fan-out runs concurrently: against a remote store a serial walk is one
 * round trip per stack before the first stage is even known. A pinned
 * `stack`/`stage` is taken at face value and skips the corresponding call —
 * naming a scope is not a claim that it exists, and callers report a missing
 * one from the emptiness of what comes back.
 *
 * Ordered by stack then stage so every traversal built on it is deterministic.
 */
export const allStages = Effect.fn("allStages")(function* (filter = {}) {
    return yield* stagesOf(yield* yield* State, filter);
});
const stagesOf = (state, filter) => Effect.gen(function* () {
    const stacks = filter.stack !== undefined
        ? [filter.stack]
        : [...(yield* state.listStacks())].sort();
    if (filter.stage !== undefined) {
        const stage = filter.stage;
        return stacks.map((stack) => ({ stack, stage }));
    }
    const perStack = yield* Effect.forEach(stacks, (stack) => Effect.map(state.listStages(stack), (stages) => [...stages].sort().map((stage) => ({ stack, stage }))), { concurrency: "unbounded" });
    return perStack.flat();
});
const pathParts = (path) => (path ?? "").split("/").filter((part) => part !== "" && part !== ".");
const invalidPath = (path, reason = "path does not exist") => Effect.fail(new InvalidStatePath({ path, reason }));
const parsePath = (path) => {
    const parts = pathParts(path);
    return parts.includes("..")
        ? invalidPath(path ?? "/", "parent path segments are not allowed")
        : Effect.succeed(parts);
};
const stageFiles = Effect.fn(function* (state, stack, stage) {
    const fqns = yield* state.list({ stack, stage });
    return [
        ...fqns.map((fqn) => ({
            kind: "resource",
            path: `${stack}/${stage}/${fqn}`,
            stack,
            stage,
            fqn,
        })),
        {
            kind: "output",
            path: `${stack}/${stage}/output`,
            stack,
            stage,
        },
    ];
});
/** Every file under the given scope, listed one stage at a time in parallel. */
const filesUnder = Effect.fn(function* (state, filter = {}) {
    const stages = yield* stagesOf(state, filter);
    const perStage = yield* Effect.forEach(stages, ({ stack, stage }) => stageFiles(state, stack, stage), { concurrency: "unbounded" });
    return perStage.flat();
});
const filesAt = Effect.fn(function* (state, parts) {
    const path = parts.join("/");
    if (parts.length === 0) {
        return { directory: true, files: yield* filesUnder(state) };
    }
    if (parts.length === 1) {
        const stack = parts[0];
        if (!(yield* state.listStacks()).includes(stack)) {
            return yield* invalidPath(path);
        }
        return {
            directory: true,
            files: yield* filesUnder(state, { stack }),
        };
    }
    if (parts.length === 2) {
        const [stack, stage] = parts;
        if (!(yield* state.listStages(stack)).includes(stage)) {
            return yield* invalidPath(path);
        }
        return {
            directory: true,
            files: yield* stageFiles(state, stack, stage),
        };
    }
    const files = yield* stageFiles(state, parts[0], parts[1]);
    const exact = files.find((file) => file.path === path);
    if (exact !== undefined)
        return { directory: false, files: [exact] };
    const descendants = files.filter((file) => file.path.startsWith(`${path}/`));
    if (descendants.length === 0)
        return yield* invalidPath(path);
    return { directory: true, files: descendants };
});
export const listState = Effect.fn("listState")(function* ({ path, recursive = false, }) {
    const state = yield* yield* State;
    const parts = yield* parsePath(path);
    const normalizedPath = parts.join("/");
    if (parts.length === 0 && !recursive) {
        return (yield* state.listStacks()).map((stack) => `${stack}/`);
    }
    const { directory, files } = yield* filesAt(state, parts);
    if (!directory)
        return [normalizedPath];
    const prefix = normalizedPath === "" ? "" : `${normalizedPath}/`;
    if (recursive)
        return files.map((file) => file.path);
    return [
        ...new Set(files.map((file) => {
            const rest = file.path.slice(prefix.length);
            const child = rest.split("/")[0];
            return rest.includes("/") ? `${prefix}${child}/` : file.path;
        })),
    ];
});
export const readState = Effect.fn("readState")(function* ({ path, recursive = false, }) {
    const state = yield* yield* State;
    const parts = yield* parsePath(path);
    const target = yield* filesAt(state, parts);
    if (target.directory && !recursive) {
        return yield* invalidPath(path ?? "/", "path is a directory; set recursive to read its descendants");
    }
    return yield* Effect.forEach(target.files, (file) => (file.kind === "output" ? state.getOutput(file) : state.get(file)).pipe(Effect.map((value) => ({
        path: file.path,
        kind: file.kind,
        value: encodeState(value) ?? null,
    }))));
});
export const deleteState = Effect.fn("deleteState")(function* ({ path, recursive = false, }) {
    const state = yield* yield* State;
    const parts = yield* parsePath(path);
    if (parts.length === 0) {
        return yield* invalidPath(path, "the state root cannot be deleted");
    }
    const target = yield* filesAt(state, parts);
    if (target.directory && !recursive) {
        return yield* invalidPath(path, "path is a directory; set recursive to delete its descendants");
    }
    if (parts.length === 1) {
        yield* state.deleteStack({ stack: parts[0] });
    }
    else if (parts.length === 2) {
        yield* state.deleteStack({ stack: parts[0], stage: parts[1] });
    }
    else {
        const resources = target.files.filter((file) => file.kind === "resource");
        if (resources.length === 0) {
            return yield* invalidPath(path, "output cannot be deleted independently");
        }
        yield* Effect.forEach(resources, (file) => state.delete(file), {
            concurrency: 32,
            discard: true,
        });
    }
    return {
        _tag: "StateDeleted",
        path: parts.join("/"),
        deleted: target.files.map((file) => file.path),
    };
});
//# sourceMappingURL=Tree.js.map