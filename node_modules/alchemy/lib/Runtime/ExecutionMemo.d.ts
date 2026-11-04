import * as Effect from "effect/Effect";
import * as Scope from "effect/Scope";
/**
 * Allocate a per-execution memo cell for `build`. The returned accessor runs
 * `build` at most once per execution scope (Worker fetch/queue/scheduled
 * event, DO call, Workflow run, Lambda invoke) and builds it WITH that scope
 * (`Layer.build` / `Scope`-requiring acquires see the execution scope), so
 * release finalizers fire when the event settles — never held across events.
 * This is the only legal pooling shape on workerd (sockets are
 * IoContext-pinned) and the correct one on Lambda (the instance scope must
 * not own disposables).
 *
 * The `Effect.sync` wrapper allocates the memo's symbol key once per *call
 * site* (i.e. once per layer construction), so distinct clients built from
 * distinct `makeExecutionMemo` calls never share a memo cell even inside the
 * same execution.
 *
 * The memo key and the finalizer target are always the same scope object
 * (`yield* Effect.scope`), so they cannot disagree: wrapping queries in a
 * nested `Effect.scoped` narrows both the memo and the resource's lifetime
 * to that block.
 *
 * The accessor's `Scope` requirement is erased from its type — every runtime
 * bridge provides a fresh execution `Scope`, exactly like
 * `Drizzle.Postgres` before this primitive was extracted. Evaluating the
 * accessor outside an execution scope is a defect.
 */
export declare const makeExecutionMemo: <A, E, R>(build: Effect.Effect<A, E, R | Scope.Scope>) => Effect.Effect<Effect.Effect<A, E, Exclude<R, Scope.Scope>>>;
//# sourceMappingURL=ExecutionMemo.d.ts.map