import * as Layer from "effect/Layer";
import { RestoreTable } from "./RestoreTable.ts";
/**
 * HTTP implementation of {@link RestoreTable}: grants `cassandra:Select` on
 * the source table plus `cassandra:Restore` (and the `Create`/`TagResource`
 * actions the restore performs) on the target keyspace and its tables, and
 * calls the Keyspaces HTTP API with the function's IAM credentials.
 */
export declare const RestoreTableHttp: Layer.Layer<RestoreTable, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=RestoreTableHttp.d.ts.map