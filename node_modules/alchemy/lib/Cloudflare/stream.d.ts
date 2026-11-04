import type * as runtime from "@cloudflare/workers-types";
import * as Stream from "effect/Stream";
type ReplaceEffectStream<T> = T extends Stream.Stream<any> ? runtime.ReadableStream<any> : T;
/**
 * If the value is an Effect stream, converts it to a ReadableStream.
 * Otherwise, returns the value unchanged.
 */
export declare function replaceEffectStream<T>(value: T): ReplaceEffectStream<T>;
export {};
//# sourceMappingURL=stream.d.ts.map