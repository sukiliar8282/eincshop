import * as Layer from "effect/Layer";
import { BusSink } from "./BusSink.ts";
import { PutEvents } from "./PutEvents.ts";
/**
 * HTTP implementation of {@link BusSink}. At deploy time it grants
 * `events:PutEvents` on the bound bus (or the default bus); at runtime it
 * batches stream elements into `PutEvents` calls (10 entries / 256 KiB) with
 * bounded retry of transient per-entry failures. Provide this layer on the
 * Function using the sink.
 */
export declare const BusSinkHttp: Layer.Layer<BusSink, never, PutEvents>;
//# sourceMappingURL=BusSinkHttp.d.ts.map