import * as Layer from "effect/Layer";
import { DeliveryStreamSink } from "./DeliveryStreamSink.ts";
import { PutRecordBatch } from "./PutRecordBatch.ts";
/**
 * HTTP implementation of {@link DeliveryStreamSink}. At deploy time it grants
 * `firehose:PutRecordBatch` on the bound delivery stream; at runtime it
 * batches stream elements into `PutRecordBatch` calls (500 records / 4 MiB)
 * with bounded retry of transient per-record failures. Provide this layer on
 * the Function using the sink.
 */
export declare const DeliveryStreamSinkHttp: Layer.Layer<DeliveryStreamSink, never, PutRecordBatch>;
//# sourceMappingURL=DeliveryStreamSinkHttp.d.ts.map