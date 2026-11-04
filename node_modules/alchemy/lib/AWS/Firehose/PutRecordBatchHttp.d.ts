import * as Layer from "effect/Layer";
import { PutRecordBatch } from "./PutRecordBatch.ts";
/**
 * HTTP implementation of {@link PutRecordBatch}. At deploy time it grants
 * `firehose:PutRecordBatch` on the bound delivery stream; at runtime it calls
 * the Firehose API with the host Function's credentials. Provide this layer
 * on the Function using the binding.
 */
export declare const PutRecordBatchHttp: Layer.Layer<PutRecordBatch, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=PutRecordBatchHttp.d.ts.map