import * as elasticache from "@distilled.cloud/aws/elasticache";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ReplicationGroupProps {
    /** Replication group identifier. Generated deterministically when omitted. */
    replicationGroupId?: string;
    /** Required human-readable description. */
    description: string;
    /** Cache engine. */
    engine: "valkey" | "redis";
    engineVersion?: string;
    /** ElastiCache node type. Must start with `cache.`, for example `cache.t4g.micro`. @default cache.t4g.micro */
    nodeType?: `cache.${string}`;
    subnetGroupName?: string;
    securityGroupIds?: string[];
    /** Shard count. Changes use online resharding. */
    numNodeGroups?: number;
    /** Read replicas per shard, from 0 through 5. */
    replicasPerNodeGroup?: number;
    automaticFailoverEnabled?: boolean;
    multiAzEnabled?: boolean;
    parameterGroupName?: string;
    port?: number;
    maintenanceWindow?: string;
    snapshotRetentionLimit?: number;
    snapshotWindow?: string;
    autoMinorVersionUpgrade?: boolean;
    /** Enables TLS for client connections. @default true */
    transitEncryptionEnabled?: boolean;
    transitEncryptionMode?: elasticache.TransitEncryptionMode;
    atRestEncryptionEnabled?: boolean;
    kmsKeyId?: string;
    networkType?: elasticache.NetworkType;
    ipDiscovery?: elasticache.IpDiscovery;
    /** User group IDs for Valkey/Redis RBAC. */
    userGroupIds?: string[];
    /** Snapshot used only while creating a new group. */
    snapshotName?: string;
    snapshotArns?: string[];
    /** Optional final snapshot created before destroy. */
    finalSnapshotName?: string;
    tags?: Record<string, string>;
}
export interface ReplicationGroup extends Resource<"AWS.ElastiCache.ReplicationGroup", ReplicationGroupProps, {
    replicationGroupId: string;
    replicationGroupArn: string;
    status: string;
    engine: string;
    engineVersion: string | undefined;
    nodeType: string | undefined;
    configurationEndpointAddress: string | undefined;
    configurationEndpointPort: number | undefined;
    primaryEndpointAddress: string | undefined;
    primaryEndpointPort: number | undefined;
    readerEndpointAddress: string | undefined;
    readerEndpointPort: number | undefined;
    transitEncryptionEnabled: boolean;
    nodeGroupIds: string[];
    tags: Record<string, string>;
}, never, Providers> {
}
declare const InvalidReplicationGroupConfiguration_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "InvalidReplicationGroupConfiguration";
} & Readonly<A>;
/** Invalid desired topology rejected before AWS can start a partial create. */
export declare class InvalidReplicationGroupConfiguration extends InvalidReplicationGroupConfiguration_base<{
    message: string;
}> {
}
export declare const validateReplicationGroupProps: (props: ReplicationGroupProps) => InvalidReplicationGroupConfiguration | undefined;
/**
 * A provisioned Valkey or Redis OSS replication group.
 *
 * ### Creating a Highly Available Cache
 * **Example:** Valkey with a replica in a VPC
 * ```typescript
 * const cache = yield* ReplicationGroup("Cache", {
 *   description: "application cache",
 *   engine: "valkey",
 *   subnetGroupName: subnets.subnetGroupName,
 *   securityGroupIds: [cacheSecurityGroup.groupId],
 *   replicasPerNodeGroup: 1,
 *   automaticFailoverEnabled: true,
 *   multiAzEnabled: true,
 *   transitEncryptionEnabled: true,
 * });
 * ```
 *
 * @resource
 */
export declare const ReplicationGroup: import("../../Resource.ts").ResourceClass<ReplicationGroup>;
export declare const ReplicationGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<ReplicationGroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=ReplicationGroup.d.ts.map