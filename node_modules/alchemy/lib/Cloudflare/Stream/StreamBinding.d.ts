import type * as Binding from "../Workers/Binding.ts";
import { Stream, type StreamClient } from "./Stream.ts";
/** The binding value produced by calling {@link Stream} (declared on `env` or `yield*`-ed). */
export type StreamBinding = Binding.Binding<Stream["key"], StreamClient, Stream>;
/**
 * The layer that provides the Effect-native interface for the Cloudflare
 * Stream binding.
 *
 * Provide it on the Worker effect (`Effect.provide(Cloudflare.Stream.StreamBinding)`)
 * so that yielding a {@link Stream} binding attaches the native `stream`
 * binding to the surrounding Worker at deploy time and, at runtime, resolves to
 * the Effect-native {@link StreamClient} (wrapping the raw `cf.StreamBinding`
 * handle so every operation returns an `Effect`).
 */
export declare const StreamBinding: import("effect/Layer").Layer<Stream, never, import("../index.ts").WorkerEnvironment>;
//# sourceMappingURL=StreamBinding.d.ts.map