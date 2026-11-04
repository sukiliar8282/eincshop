import * as Layer from "effect/Layer";
import { TableStreams } from "./TableStreams.ts";
/**
 * HTTP implementation of {@link TableStreams}: grants the CDC stream read
 * actions (`cassandra:ListStreams` / `GetStream` / `GetShardIterator` /
 * `GetRecords`) on the bound table and its streams, and calls the Keyspaces
 * streams HTTP API with the function's IAM credentials.
 */
export declare const TableStreamsHttp: Layer.Layer<TableStreams, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=TableStreamsHttp.d.ts.map