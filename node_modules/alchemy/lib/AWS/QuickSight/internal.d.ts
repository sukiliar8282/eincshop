import * as quicksight from "@distilled.cloud/aws/quicksight";
import * as Effect from "effect/Effect";
declare const QuickSightNotSettled_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "QuickSightNotSettled";
} & Readonly<A>;
/**
 * A QuickSight resource whose asynchronous create/update has not converged
 * to a terminal status yet.
 */
export declare class QuickSightNotSettled extends QuickSightNotSettled_base<{
    readonly resourceId: string;
    readonly status: string | undefined;
}> {
}
declare const QuickSightOperationFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "QuickSightOperationFailed";
} & Readonly<A>;
/**
 * A QuickSight resource whose asynchronous create/update converged to a
 * `*_FAILED` status.
 */
export declare class QuickSightOperationFailed extends QuickSightOperationFailed_base<{
    readonly resourceId: string;
    readonly status: string;
    readonly reason: string | undefined;
}> {
}
/**
 * Poll a QuickSight resource until its `ResourceStatus` reaches a terminal
 * value. `*_IN_PROGRESS` repeats (bounded); `*_FAILED` fails immediately.
 * Creation/update of most QuickSight resources settles within a few seconds
 * (data-source connectivity validation can take longer) — budget ~2.5 min.
 *
 * The explicit `Effect.Effect<A, E, R>` return annotation is load-bearing:
 * inlining retry/repeat combinators in provider lifecycle code lets their
 * conditional return types survive into declaration emit and widen the
 * provider layer to `unknown` (see `../VpcLattice/internal.ts`).
 *
 * If the bounded schedule is exhausted while the resource is still
 * `*_IN_PROGRESS`, the last observation is returned as-is so the caller sees
 * the real (still-converging) resource rather than a spurious failure.
 */
export declare const waitForSettled: <A extends {
    status?: string;
}, E extends {
    readonly _tag: string;
}, R>(resourceId: string, read: Effect.Effect<A | undefined, E, R>) => Effect.Effect<A | undefined, E | QuickSightOperationFailed, R>;
/**
 * Convert a QuickSight wire tag list into a plain record.
 */
export declare const toTagRecord: (tags: ReadonlyArray<{
    Key?: string;
    Value?: string;
}> | undefined) => Record<string, string>;
/**
 * Read the observed tags of a QuickSight resource by ARN. Best-effort — a
 * failure (e.g. a race with deletion) reports no tags.
 */
export declare const readQuickSightTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync tags on a QuickSight resource: diff OBSERVED cloud tags against the
 * desired set and apply only the delta.
 */
export declare const syncQuickSightTags: (arn: string, desiredTags: Record<string, string>) => Effect.Effect<void, quicksight.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Convert a desired tag record into the wire tag list for create calls.
 * QuickSight requires a non-empty `Tags` list when supplied, so an empty
 * record maps to `undefined`.
 */
export declare const toWireTags: (tags: Record<string, string>) => quicksight.Tag[] | undefined;
export {};
//# sourceMappingURL=internal.d.ts.map