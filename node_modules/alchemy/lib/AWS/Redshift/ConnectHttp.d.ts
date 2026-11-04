import * as Layer from "effect/Layer";
import { Connect } from "./Connect.ts";
/**
 * SDK-backed implementation of {@link Connect}. Deploy half attaches the
 * `redshift:GetClusterCredentials[WithIAM]` policy scoped to the cluster's
 * `dbname`/`dbuser`/`dbgroup` ARNs and publishes
 * `REDSHIFT_{LOGICAL_ID}_{HOST,PORT}` on the host Function; runtime half
 * mints temporary credentials via the corresponding SDK operation and
 * formats a pgwire connection URL.
 */
export declare const ConnectHttp: Layer.Layer<Connect, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ConnectHttp.d.ts.map