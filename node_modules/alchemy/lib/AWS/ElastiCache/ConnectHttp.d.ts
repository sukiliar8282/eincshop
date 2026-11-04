import * as Layer from "effect/Layer";
import { Connect } from "./Connect.ts";
/**
 * Environment-only implementation of {@link Connect}. At deploy time it
 * publishes the cache endpoint as `ELASTICACHE_{LOGICAL_ID}_{HOST,PORT,TLS}`
 * environment variables on the host Function; at runtime it resolves the
 * same values into a typed connection descriptor. No IAM policy is attached
 * — the classic valkey/redis/memcached data plane is governed by VPC
 * security groups, not IAM.
 */
export declare const ConnectHttp: Layer.Layer<Connect, never, never>;
//# sourceMappingURL=ConnectHttp.d.ts.map