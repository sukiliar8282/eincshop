import * as Effect from "effect/Effect";
import type { Directory } from "./Directory.ts";
/**
 * Shared scaffolding for AWS Directory Service HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the two builders
 * below. Everything except the operation and the IAM action list is
 * boilerplate.
 */
/**
 * Build the impl Effect for an account-level Directory Service operation
 * (enumerating directories, reading account limits). The deploy-time half
 * grants `actions` on `*` — these actions do not support resource-level
 * permissions.
 */
export declare const makeDirectoryServiceAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.DirectoryService.GetDirectoryLimits`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a Directory Service operation scoped to one
 * {@link Directory}: the deploy-time half grants `actions` on the bound
 * directory's ARN (`arn:aws:ds:{region}:{account}:directory/{id}`), and the
 * runtime half injects the directory's `DirectoryId` into every request.
 */
export declare const makeDirectoryHttpBinding: <I extends {
    DirectoryId?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.DirectoryService.CreateSnapshot`. */
    tag: string;
    /** The distilled operation; `DirectoryId` is injected from the directory. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the directory ARN. */
    actions: readonly string[];
}) => Effect.Effect<(directory: Directory) => Effect.Effect<(request?: Omit<I, "DirectoryId"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map