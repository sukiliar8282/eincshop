import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.js";
import * as Output from "../../Output.js";
import { unpackEnvValue } from "../../RuntimeContext.js";
import { isBindingHost } from "../Lambda/Function.js";
import { ConnectCacheCluster, cacheClusterConnectEnvPrefix, } from "./ConnectCacheCluster.js";
export const ConnectCacheClusterHttp = Layer.effect(ConnectCacheCluster, Effect.gen(function* () {
    return Effect.fn(function* (cluster, options) {
        const prefix = cacheClusterConnectEnvPrefix(cluster.LogicalId);
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const host = yield* Binding.Host;
            if (isBindingHost(host)) {
                yield* host.bind `Allow(${host}, AWS.ElastiCache.ConnectCacheCluster(${cluster}))`({
                    env: {
                        [`${prefix}_ENDPOINTS`]: Output.map(cluster.endpoints, JSON.stringify),
                        [`${prefix}_TLS`]: Output.map(cluster.transitEncryptionEnabled, (tls) => String(tls ?? false)),
                    },
                    ...(options?.subnetIds || options?.securityGroupIds
                        ? {
                            vpc: {
                                subnetIds: options?.subnetIds ?? [],
                                securityGroupIds: options?.securityGroupIds ?? [],
                            },
                        }
                        : {}),
                });
            }
        }
        return Effect.gen(function* () {
            const endpoints = unpackEnvValue(process.env[`${prefix}_ENDPOINTS`]);
            if (endpoints !== undefined) {
                if (!endpoints.length) {
                    return yield* Effect.die(`Memcached endpoints for '${cluster.LogicalId}' are not available`);
                }
                return {
                    endpoints,
                    tls: unpackEnvValue(process.env[`${prefix}_TLS`]) ?? false,
                };
            }
            const clusterEndpoints = yield* yield* cluster.endpoints;
            if (!clusterEndpoints.length) {
                return yield* Effect.die(`Memcached endpoints for '${cluster.LogicalId}' are not available yet`);
            }
            return {
                endpoints: clusterEndpoints,
                tls: yield* yield* cluster.transitEncryptionEnabled,
            };
        });
    });
}));
//# sourceMappingURL=ConnectCacheClusterHttp.js.map