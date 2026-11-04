import * as Binding from "../../Binding.js";
import { connectEnvPrefix as makeConnectEnvPrefix } from "../Connection/internal.js";
export const replicationGroupConnectEnvPrefix = (logicalId) => makeConnectEnvPrefix("ELASTICACHE", logicalId);
export const ConnectReplicationGroup = Binding.Service("AWS.ElastiCache.ConnectReplicationGroup");
//# sourceMappingURL=ConnectReplicationGroup.js.map