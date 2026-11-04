import * as Layer from "effect/Layer";
import { Connect } from "./Connect.ts";
/**
 * Implementation of {@link Connect}. At deploy time it publishes the cluster
 * endpoint as `MEMORYDB_{LOGICAL_ID}_{HOST,PORT,TLS}` environment variables
 * on the host Function and grants `memorydb:Connect` on the cluster ARN plus
 * any IAM-auth users' ARNs; at runtime it resolves the same values into a
 * typed connection descriptor. The valkey/redis data plane itself is reached
 * over the VPC network — password auth needs no IAM, while IAM auth
 * additionally requires the `memorydb:Connect` grant this binding attaches.
 */
export declare const ConnectHttp: Layer.Layer<Connect, never, never>;
//# sourceMappingURL=ConnectHttp.d.ts.map