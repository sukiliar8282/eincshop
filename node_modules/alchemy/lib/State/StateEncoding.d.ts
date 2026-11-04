import * as Duration from "effect/Duration";
/**
 * JSON marker used to tag a `Redacted<T>` value when writing state.
 * The reviver recognises objects with exactly this key and rebuilds
 * the `Redacted` wrapper on read.
 */
export declare const REDACTED_MARKER = "__redacted__";
/**
 * JSON marker used to tag a `Duration` value when writing state.
 * The reviver recognises objects with exactly this key and rebuilds
 * a real `Duration` instance on read so that downstream code can call
 * `Duration.toSeconds`, `Duration.toMillis`, etc. without first
 * decoding `Duration.toJSON`'s `{_id,_tag,...}` shape.
 */
export declare const DURATION_MARKER = "__duration__";
/**
 * JSON marker used to tag a `Date` value when writing state. The reviver
 * recognises objects with exactly this key and rebuilds a real `Date`
 * instance on read, so a Date-typed prop read back out of persisted state
 * (`olds` in provider `diff`/`delete`/`read`) is a `Date` again — not the
 * bare ISO string `JSON.stringify` would otherwise leave behind.
 */
export declare const DATE_MARKER = "__date__";
/**
 * Rebuild a {@link Duration.Duration} from `Duration.toJSON`'s
 * `{_id,_tag,millis?,nanos?}` shape. Shared by state persistence and the
 * RPC sidecar — that JSON is not a valid `Duration.Input`.
 */
export declare const decodeDuration: (encoded: unknown) => Duration.Duration | undefined;
/**
 * Recursively encode a state value for JSON serialisation.
 *
 * - `Redacted<T>` values are wrapped as `{ [REDACTED_MARKER]: <inner> }`
 *   so the actual string is persisted rather than the `<redacted>`
 *   placeholder produced by the default `toJSON`.
 * - `Resource` instances are flattened to `{ id, type, props, attr }`
 *   so persisted state matches the schema used by the loader.
 * - Plain objects and arrays are walked structurally.
 */
export declare const encodeState: (value: unknown) => unknown;
/**
 * JSON reviver that rebuilds `Redacted<T>` values that were written
 * through {@link encodeState}. Intended for use with `JSON.parse`.
 */
export declare const reviveState: (_key: string, value: unknown) => unknown;
/**
 * Recursively walk an already-decoded value and rebuild `Redacted<T>`
 * instances from `{ [REDACTED_MARKER]: <inner> }` envelopes. Mirror
 * image of {@link encodeState} for callers that hold a parsed JS
 * value rather than a JSON string (e.g. the HTTP state-store client,
 * which receives values pre-parsed by `HttpApiClient`).
 */
export declare const reviveStateRecursive: (value: unknown) => unknown;
//# sourceMappingURL=StateEncoding.d.ts.map