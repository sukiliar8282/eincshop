import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ReplicationInstanceProps {
    /**
     * Replication-instance identifier. Must be lowercase, 1-63 characters,
     * begin with a letter, and contain only letters, digits, and hyphens. If
     * omitted, a deterministic physical name is generated. Changing it replaces
     * the instance.
     */
    replicationInstanceIdentifier?: string;
    /**
     * Compute and memory class, e.g. `"dms.t3.micro"`, `"dms.c5.large"`.
     */
    replicationInstanceClass: string;
    /**
     * Storage in gigabytes allocated to the replication instance.
     * @default service-chosen for the instance class
     */
    allocatedStorage?: number;
    /**
     * VPC security group IDs controlling network access to the instance.
     */
    vpcSecurityGroupIds?: string[];
    /**
     * Availability Zone the instance is created in. Changing it replaces the
     * instance.
     */
    availabilityZone?: string;
    /**
     * Subnet group the instance is placed in. Changing it replaces the
     * instance.
     */
    replicationSubnetGroupIdentifier?: string;
    /**
     * Weekly maintenance window in `ddd:hh24:mi-ddd:hh24:mi` (UTC) format.
     */
    preferredMaintenanceWindow?: string;
    /**
     * Whether to provision the instance across multiple Availability Zones.
     * @default false
     */
    multiAZ?: boolean;
    /**
     * DMS engine version.
     * @default latest
     */
    engineVersion?: string;
    /**
     * Whether minor engine upgrades are applied automatically during the
     * maintenance window.
     * @default true
     */
    autoMinorVersionUpgrade?: boolean;
    /**
     * Customer-managed KMS key for storage encryption. Changing it replaces the
     * instance.
     * @default AWS-owned DMS key
     */
    kmsKeyId?: string;
    /**
     * Whether the instance gets a public IP address. Changing it replaces the
     * instance.
     * @default true
     */
    publiclyAccessible?: boolean;
    /**
     * Network type: `"IPV4"`, `"IPV6"`, or `"DUAL"`. Changing it replaces the
     * instance.
     */
    networkType?: string;
    /**
     * User-defined tags for the instance.
     */
    tags?: Record<string, string>;
}
export interface ReplicationInstance extends Resource<"AWS.DMS.ReplicationInstance", ReplicationInstanceProps, {
    /** The replication instance identifier (unique per account/region). */
    replicationInstanceIdentifier: string;
    /** The ARN of the replication instance. */
    replicationInstanceArn: string;
    /** The compute class of the instance, e.g. `dms.t3.micro`. */
    replicationInstanceClass: string;
    /** The current status of the instance, e.g. `available`. */
    status: string | undefined;
    /** The DMS engine version running on the instance. */
    engineVersion: string | undefined;
    /** The private IP addresses of the instance. */
    privateIpAddresses: string[];
    /** The public IP addresses of the instance (when publicly accessible). */
    publicIpAddresses: string[];
    /** The tags attached to the replication instance. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A DMS replication instance — the managed compute that runs migration and
 * replication tasks. Provisioning takes several minutes and the instance is
 * billed hourly while it exists, so create it only when a migration is
 * running and destroy it promptly.
 * ### Creating a Replication Instance
 * **Example:** Small Instance in a Subnet Group
 * ```typescript
 * const instance = yield* ReplicationInstance("Migration", {
 *   replicationInstanceClass: "dms.t3.micro",
 *   allocatedStorage: 50,
 *   replicationSubnetGroupIdentifier: subnetGroup.replicationSubnetGroupIdentifier,
 *   publiclyAccessible: false,
 * });
 * ```
 *
 * @resource
 */
export declare const ReplicationInstance: import("../../Resource.ts").ResourceClass<ReplicationInstance>;
export declare const ReplicationInstanceProvider: () => import("effect/Layer").Layer<Provider.Provider<ReplicationInstance>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ReplicationInstance.d.ts.map