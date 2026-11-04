/**
 * Shared scaffolding for EventBridge Pipes HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the builders
 * below. Everything except the operation and the IAM action list is
 * boilerplate:
 *
 * - Pipe-scoped operations (`pipes:DescribePipe`, `pipes:StartPipe`,
 *   `pipes:StopPipe`) inject the bound {@link Pipe}'s name as the request's
 *   `Name` field and are granted on the pipe ARN.
 * - Account-level operations (`pipes:ListPipes`) take the caller's request
 *   as-is and are granted on `*`.
 */
import * as Effect from "effect/Effect";
import type { Pipe } from "./Pipe.ts";
/**
 * Build the impl Effect for a Pipes operation scoped to a {@link Pipe}: the
 * deploy-time half grants `actions` on the bound pipe's ARN, and the runtime
 * half injects the pipe's name as the request's `Name` field.
 */
export declare const makePipesHttpBinding: <I extends {
    Name: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Pipes.StartPipe`. */
    tag: string;
    /** The distilled operation; `Name` is injected from the pipe. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the pipe ARN. */
    actions: readonly string[];
}) => Effect.Effect<(pipe: Pipe) => Effect.Effect<(request?: Omit<I, "Name"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an account-level Pipes operation (pipe listing).
 * The deploy-time half grants `actions` on `*` — these operations are not
 * scoped to a single pipe resource.
 */
export declare const makePipesAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Pipes.ListPipes`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map