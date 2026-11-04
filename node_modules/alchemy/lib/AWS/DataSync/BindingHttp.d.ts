import * as Effect from "effect/Effect";
import type { Task } from "./Task.ts";
/**
 * Build the impl Effect for an operation whose input carries a `TaskArn`
 * field: the runtime callable injects the bound {@link Task}'s ARN and the
 * deploy-time half grants `actions` on the task ARN (and its execution
 * pattern).
 */
export declare const makeDataSyncTaskHttpBinding: <I extends {
    TaskArn?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.DataSync.StartTaskExecution`. */
    tag: string;
    /** The distilled operation; `TaskArn` is injected from the task. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the task ARN + execution pattern. */
    actions: readonly string[];
}) => Effect.Effect<(task: Task) => Effect.Effect<(request?: Omit<I, "TaskArn"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a task-anchored operation whose input addresses
 * a task *execution* by ARN (returned by `StartTaskExecution`): the request
 * passes through as-is and the deploy-time half grants `actions` on the
 * bound task's ARN + execution pattern.
 */
export declare const makeDataSyncTaskExecutionHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.DataSync.CancelTaskExecution`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the task ARN + execution pattern. */
    actions: readonly string[];
}) => Effect.Effect<(task: Task) => Effect.Effect<(request: I) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map