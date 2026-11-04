import * as Binding from "../Workers/Binding.ts";
import { Images, type ImagesClient } from "./Images.ts";
/** The binding value produced by calling {@link Images} (declared on `env` or `yield*`-ed). */
export type ImagesBinding = Binding.Binding<Images["key"], ImagesClient, Images>;
/**
 * The layer that provides the Effect-native interface for the Cloudflare
 * Workers Images binding.
 *
 * Provide it on the Worker effect (`Effect.provide(Cloudflare.Images.ImagesBinding)`)
 * so that yielding an {@link Images} binding attaches the native `images`
 * binding to the surrounding Worker at deploy time and, at runtime, resolves to
 * the Effect-native {@link ImagesClient} (wrapping the raw `cf.ImagesBinding` so every
 * `info` / `input(...).transform(...).output(...)` call returns an `Effect`).
 */
export declare const ImagesBinding: import("effect/Layer").Layer<Images, never, import("../index.ts").WorkerEnvironment>;
//# sourceMappingURL=ImagesBinding.d.ts.map