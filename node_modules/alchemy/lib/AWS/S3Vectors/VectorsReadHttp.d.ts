import * as Layer from "effect/Layer";
import { VectorsRead } from "./VectorsRead.ts";
/**
 * HTTP implementation of {@link VectorsRead} — calls the S3 Vectors data
 * plane with the host Function's own credentials, granting only the read
 * actions (`QueryVectors`, `GetVectors`, `ListVectors`) on the bound index.
 */
export declare const VectorsReadHttp: Layer.Layer<VectorsRead, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=VectorsReadHttp.d.ts.map