import * as Binding from "../../Binding.js";
import { connectEnvPrefix as makeConnectEnvPrefix } from "../Connection/internal.js";
export const cacheClusterConnectEnvPrefix = (logicalId) => makeConnectEnvPrefix("ELASTICACHE", logicalId);
export const ConnectCacheCluster = Binding.Service("AWS.ElastiCache.ConnectCacheCluster");
//# sourceMappingURL=ConnectCacheCluster.js.map