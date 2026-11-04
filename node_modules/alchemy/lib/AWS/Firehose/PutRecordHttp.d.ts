import * as Layer from "effect/Layer";
import { PutRecord } from "./PutRecord.ts";
/**
 * HTTP implementation of {@link PutRecord}. At deploy time it grants
 * `firehose:PutRecord` on the bound delivery stream; at runtime it calls the
 * Firehose API with the host Function's credentials. Provide this layer on
 * the Function using the binding.
 */
export declare const PutRecordHttp: Layer.Layer<PutRecord, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=PutRecordHttp.d.ts.map