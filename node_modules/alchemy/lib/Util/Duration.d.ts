import * as Duration from "effect/Duration";
/**
 * Re-hydrate a {@link Duration.Input} that may have been persisted to (and
 * read back from) state as a structural `Duration` JSON.
 *
 * When a `Duration.Duration` round-trips through JSON state it is serialized
 * to `{ _id: "Duration", _tag: "Millis" | "Nanos" | "Infinity", ... }`, which
 * is NOT a valid {@link Duration.Input} on the way back in. This normalizes
 * such a value back to a plain input (`number` millis, `bigint` nanos, or the
 * `"Infinity"` literal). Any already-valid input (a number, a `"20 seconds"`
 * string, or a live `Duration`) is returned unchanged.
 */
export declare const normalizeDurationInput: (input: Duration.Input) => Duration.Input;
/**
 * Convert a {@link Duration.Input} to whole seconds for a wire/API field,
 * normalizing any persisted-state `Duration` JSON first. Returns `undefined`
 * when `input` is `undefined` so call sites can map optional fields directly.
 */
export declare const toWireSeconds: (input: Duration.Input | undefined) => number | undefined;
/** Convert a {@link Duration.Input} to whole milliseconds for a wire/API field. */
export declare const toWireMillis: (input: Duration.Input | undefined) => number | undefined;
/** Convert a {@link Duration.Input} to whole minutes for a wire/API field. */
export declare const toWireMinutes: (input: Duration.Input | undefined) => number | undefined;
/** Convert a {@link Duration.Input} to whole hours for a wire/API field. */
export declare const toWireHours: (input: Duration.Input | undefined) => number | undefined;
/** Convert a {@link Duration.Input} to whole days for a wire/API field. */
export declare const toWireDays: (input: Duration.Input | undefined) => number | undefined;
/**
 * Convert a {@link Duration.Input} to whole, non-negative
 * milliseconds. Returns `undefined` when `input` is `undefined`,
 * so call sites can map through optional duration fields without
 * a branch.
 */
export declare const toMillis: (input: Duration.Input | undefined) => number | undefined;
/**
 * Convert a {@link Duration.Input} to whole, non-negative seconds.
 * Returns `undefined` when `input` is `undefined`.
 */
export declare const toSeconds: (input: Duration.Input | undefined) => number | undefined;
//# sourceMappingURL=Duration.d.ts.map