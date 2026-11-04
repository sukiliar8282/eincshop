import * as Layer from "effect/Layer";
import { ExecuteQuery } from "./ExecuteQuery.ts";
/**
 * HTTP implementation of the {@link ExecuteQuery} binding — signs
 * `neptune-graph:ExecuteQuery` data-plane requests against the graph's HTTPS
 * endpoint and, at deploy time, grants the query IAM actions
 * (`ReadDataViaQuery`, `WriteDataViaQuery`, `DeleteDataViaQuery`) on the
 * bound graph to the host function.
 */
export declare const ExecuteQueryHttp: Layer.Layer<ExecuteQuery, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ExecuteQueryHttp.d.ts.map