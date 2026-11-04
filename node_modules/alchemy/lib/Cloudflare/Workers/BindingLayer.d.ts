import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type { RuntimeContext } from "../../RuntimeContext.ts";
import type { Binding } from "./Binding.ts";
import { WorkerEnvironment } from "./Worker.ts";
/**
 * Native runtime layer for a Worker-only {@link Binding}. Registers the native
 * binding on the host Worker at deploy time (via `binding.toWorkerBinding()`)
 * and builds the Effect-native client from the lazy `env[name]` accessor.
 *
 * Factored out of `Binding.ts` (which must stay free of `Worker.ts` to avoid an
 * import cycle through the contract files). Each binding's layer is a one-liner:
 * `export const XBinding = makeBindingLayer(X, makeXClient)`.
 */
export declare const makeBindingLayer: <Self, Runtime, Client>(tag: Self, makeClient: (raw: Effect.Effect<Runtime, never, RuntimeContext>, binding: Binding<string, Client, Self>) => Client) => Layer.Layer<Self, never, WorkerEnvironment>;
//# sourceMappingURL=BindingLayer.d.ts.map