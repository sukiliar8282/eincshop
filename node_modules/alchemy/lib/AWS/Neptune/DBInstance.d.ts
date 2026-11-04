import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface DBInstanceProps {
    /**
     * Instance identifier. If omitted, Alchemy generates one.
     */
    dbInstanceIdentifier?: string;
    /**
     * Neptune cluster the instance belongs to. Required — every Neptune
     * instance is a cluster member. Immutable — forces replacement.
     */
    dbClusterIdentifier: string;
    /**
     * Instance class such as `db.r6g.large`, `db.t4g.medium`, or
     * `db.serverless` (requires the cluster to have a
     * `serverlessV2ScalingConfiguration`). In-place modify.
     */
    dbInstanceClass: string;
    /**
     * Database engine. Neptune only supports `neptune`.
     * Changing the engine forces replacement.
     * @default "neptune"
     */
    engine?: string;
    /**
     * Availability zone. Immutable — forces replacement.
     */
    availabilityZone?: string;
    /**
     * Weekly maintenance window, e.g. `Mon:00:00-Mon:03:00`. In-place modify.
     */
    preferredMaintenanceWindow?: string;
    /**
     * Auto minor version upgrades. In-place modify.
     */
    autoMinorVersionUpgrade?: boolean;
    /**
     * Promotion tier inside the cluster (0-15). In-place modify.
     */
    promotionTier?: number;
    /**
     * DB (instance-level) parameter group name. In-place modify.
     */
    dbParameterGroupName?: string;
    /**
     * User-defined tags.
     */
    tags?: Record<string, string>;
}
export interface DBInstance extends Resource<"AWS.Neptune.DBInstance", DBInstanceProps, {
    /** Identifier of the instance. */
    dbInstanceIdentifier: string;
    /** ARN of the instance. */
    dbInstanceArn: string;
    /** Identifier of the cluster the instance belongs to. */
    dbClusterIdentifier: string | undefined;
    /** Instance endpoint host name. */
    endpointAddress: string | undefined;
    /** Port the instance listens on. */
    endpointPort: number | undefined;
    /** Compute class of the instance (e.g. `db.r5.large`, `db.serverless`). */
    dbInstanceClass: string | undefined;
    /** Database engine (`neptune`). */
    engine: string | undefined;
    /** Running engine version. */
    engineVersion: string | undefined;
    /** Current lifecycle status (e.g. `creating`, `available`). */
    status: string | undefined;
    /** Failover promotion priority of the instance. */
    promotionTier: number | undefined;
    /** Name of the subnet group the instance is placed in. */
    dbSubnetGroupName: string | undefined;
    /** Availability Zone the instance runs in. */
    availabilityZone: string | undefined;
    /** Weekly window during which maintenance may occur. */
    preferredMaintenanceWindow: string | undefined;
    /** Whether storage is encrypted at rest. */
    storageEncrypted: boolean | undefined;
    /** KMS key encrypting the instance's storage. */
    kmsKeyId: string | undefined;
    /** Immutable, region-unique identifier of the instance. */
    dbiResourceId: string | undefined;
    /** Whether minor engine upgrades are applied automatically. */
    autoMinorVersionUpgrade: boolean | undefined;
    /** Tags on the instance (user + internal Alchemy tags). */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon Neptune instance — a compute member of a Neptune
 * {@link DBCluster}. Storage, backup, and endpoints are managed at the
 * cluster level; the instance contributes CPU/RAM and can serve as a writer
 * or reader. Provisioning takes several minutes.
 *
 * Mutable fields (`dbInstanceClass`, `promotionTier`, maintenance window)
 * are reconciled in place; immutable fields (`engine`,
 * `dbClusterIdentifier`, `availabilityZone`) force a replacement.
 * ### Adding an Instance
 * **Example:** A Neptune writer instance
 * ```typescript
 * const writer = yield* DBInstance("Writer", {
 *   dbClusterIdentifier: cluster.dbClusterIdentifier,
 *   dbInstanceClass: "db.t4g.medium",
 * });
 * ```
 *
 * **Example:** A serverless instance
 * ```typescript
 * const writer = yield* DBInstance("Writer", {
 *   dbClusterIdentifier: cluster.dbClusterIdentifier,
 *   dbInstanceClass: "db.serverless",
 * });
 * ```
 *
 * @resource
 */
export declare const DBInstance: import("../../Resource.ts").ResourceClass<DBInstance>;
export declare const DBInstanceProvider: () => import("effect/Layer").Layer<Provider.Provider<DBInstance>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DBInstance.d.ts.map