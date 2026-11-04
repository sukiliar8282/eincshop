import type * as cf from "@cloudflare/workers-types";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type { RuntimeContext } from "../../RuntimeContext.ts";
import { Worker, WorkerEnvironment } from "../Workers/Worker.ts";
import { ReadFlags, type ReadFlagsClient } from "./ReadFlags.ts";
export declare const ReadFlagsBinding: Layer.Layer<ReadFlags, never, WorkerEnvironment | Worker<any>>;
/** @internal */
export declare const makeFlagshipClient: (raw: Effect.Effect<cf.Flagship, never, RuntimeContext>) => ReadFlagsClient;
//# sourceMappingURL=ReadFlagsBinding.d.ts.map