import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
declare const AdoptPolicy_base: Context.ServiceClass<AdoptPolicy, "AdoptPolicy", boolean>;
/**
 * AdoptPolicy controls whether the engine should "adopt" pre-existing cloud
 * resources that conflict with this stack instead of failing.
 *
 * The engine always calls a provider's `read` lifecycle operation when there
 * is no prior state and `read` is implemented. The provider's job is to
 * report two things:
 *
 *   1. Whether the resource exists (returns attributes vs. `undefined`).
 *   2. Whether *we* own it (plain attributes vs. {@link Unowned}-branded).
 *
 * The engine then routes:
 *
 *   | `read` outcome      | `adopt: false` | `adopt: true`     |
 *   | ------------------- | -------------- | ----------------- |
 *   | undefined           | create         | create            |
 *   | owned (plain attrs) | silent adopt   | silent adopt      |
 *   | {@link Unowned}     | fail           | takeover (adopt)  |
 *
 * "Owned" means a provider has affirmatively determined the resource was
 * created by this stack/stage/logical-id (typically by inspecting tags or
 * naming conventions). Resources without ownership semantics simply always
 * return plain attrs — they are treated as owned by default, so silent
 * adoption is the norm and `--adopt` is unnecessary.
 *
 * The policy can be overridden per-effect via {@link adopt} — most commonly
 * applied at the resource or stack scope.
 */
export declare class AdoptPolicy extends AdoptPolicy_base {
}
declare const OwnedBySomeoneElse_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "OwnedBySomeoneElse";
} & Readonly<A>;
/**
 * Engine-raised failure produced when `read` reports an existing resource
 * marked as {@link Unowned} and `adopt` is `false`. Surface this to the user
 * to indicate they should either re-tag the cloud resource, pick a different
 * physical name, or re-run with `--adopt` (or `adopt(true)`) to force a
 * takeover.
 */
export declare class OwnedBySomeoneElse extends OwnedBySomeoneElse_base<{
    /** A human-readable description of why the resource cannot be adopted. */
    message: string;
    /** The Resource Type (e.g. `AWS.S3.Bucket`). */
    resourceType?: string;
    /** The logical ID of the conflicting resource. */
    logicalId?: string;
    /** The physical name/identifier of the conflicting resource. */
    physicalName?: string;
}> {
}
/**
 * Brand a `read` return value as belonging to a different owner.
 *
 * Use this in a provider's `read` implementation when the resource exists in
 * the cloud but a positive ownership check (e.g. tag inspection) shows it
 * was *not* created by this stack/stage/logical-id:
 *
 * ```ts
 * read: Effect.fn(function* ({ id, output, olds }) {
 *   const settings = yield* getScriptSettings({ ... }).pipe(
 *     Effect.catchTag("WorkerNotFound", () => Effect.succeed(undefined)),
 *   );
 *   if (!settings) return undefined;
 *
 *   const attrs = { workerName, ...buildAttrs(settings) };
 *   return hasAlchemyWorkerTags(id, settings.tags) ? attrs : Unowned(attrs);
 * }),
 * ```
 *
 * The returned value is structurally still `T` — there is no wrapper to
 * unwrap. The brand is a non-enumerable symbol that the engine inspects
 * during planning to decide whether to take over (`adopt: true`) or fail
 * loudly (`adopt: false`).
 *
 * Resources without ownership semantics should simply return plain attrs —
 * the engine treats them as owned and silent adoption is the default.
 */
export declare const Unowned: {
    <T extends object>(attrs: T): T;
    is: (value: unknown) => boolean;
};
/**
 * Strip the {@link Unowned} brand from an attributes object before persisting
 * it — state should not carry per-deploy ownership-routing metadata.
 *
 * The brand is intentionally non-enumerable, so a plain spread already
 * drops it; the additional `delete` is defense-in-depth in case a future
 * change makes the descriptor enumerable. Always returns a fresh object
 * (never mutates the input).
 */
export declare const stripUnowned: <T extends object>(attrs: T) => T;
export declare const adopt: {
    (enabled?: boolean): <A, E, R = never>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
    <R1 = never>(enabled: Effect.Effect<boolean, never, R1>): <A, E, R2 = never>(effect: Effect.Effect<A, E, R2>) => Effect.Effect<A, E, R1 | R2>;
};
export {};
//# sourceMappingURL=AdoptPolicy.d.ts.map