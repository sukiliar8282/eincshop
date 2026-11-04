import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
/**
 * If the value is an Effect stream, converts it to a ReadableStream.
 * Otherwise, returns the value unchanged.
 */
export function replaceEffectStream(value) {
    if (isEffectStream(value)) {
        return Stream.toReadableStream(value);
    }
    return value;
}
const isEffectStream = (value) => Predicate.hasProperty(value, "~effect/Stream");
//# sourceMappingURL=stream.js.map