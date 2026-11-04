import * as influxdb from "@distilled.cloud/aws/timestream-influxdb";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type DbInstanceStatus = influxdb.Status;
export interface DbInstanceProps {
    /**
     * Name that uniquely identifies the DB instance. Must be 3–40 characters,
     * start with a letter, and contain only lowercase letters, numbers, and
     * hyphens.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * The compute instance type to run InfluxDB on (e.g. `db.influx.medium`).
     */
    dbInstanceType: influxdb.DbInstanceType;
    /**
     * The amount of storage to allocate, in GiB.
     */
    allocatedStorage: number;
    /**
     * The IDs of the VPC subnets the DB instance is attached to.
     */
    vpcSubnetIds: string[];
    /**
     * The VPC security group IDs to associate with the DB instance.
     */
    vpcSecurityGroupIds: string[];
    /**
     * The initial InfluxDB admin password. Stored in AWS Secrets Manager by
     * Timestream; supplied only at creation. Pass a redacted value, e.g.
     * `Redacted.make("super-secret-password")`.
     */
    password: Redacted.Redacted<string>;
    /**
     * The initial InfluxDB admin username.
     * @default "admin"
     */
    username?: string;
    /**
     * The name of the initial InfluxDB organization.
     */
    organization?: string;
    /**
     * The name of the initial InfluxDB bucket.
     */
    bucket?: string;
    /**
     * The storage tier (IOPS profile) for the DB instance.
     */
    dbStorageType?: influxdb.DbStorageType;
    /**
     * Whether the DB instance has a public IP and is reachable from the internet.
     * @default false
     */
    publiclyAccessible?: boolean;
    /**
     * Single- or multi-AZ deployment.
     * @default "SINGLE_AZ"
     */
    deploymentType?: influxdb.DeploymentType;
    /**
     * The identifier of an InfluxDB parameter group to associate.
     */
    dbParameterGroupIdentifier?: string;
    /**
     * Log delivery (S3) configuration for InfluxDB engine logs.
     */
    logDeliveryConfiguration?: influxdb.LogDeliveryConfiguration;
    /**
     * The port InfluxDB listens on.
     * @default 8086
     */
    port?: number;
    /**
     * The network protocol (IPv4 or dual-stack).
     */
    networkType?: influxdb.NetworkType;
    /**
     * Tags to associate with the DB instance.
     */
    tags?: Record<string, string>;
}
export interface DbInstance extends Resource<"AWS.Timestream.DbInstance", DbInstanceProps, {
    /**
     * Service-assigned unique identifier for the DB instance.
     */
    id: string;
    /**
     * The DB instance's name.
     */
    name: string;
    /**
     * ARN of the DB instance.
     */
    arn: string;
    /**
     * Current lifecycle status of the DB instance.
     */
    status: DbInstanceStatus | undefined;
    /**
     * The connection endpoint (host) for the DB instance.
     */
    endpoint: string | undefined;
    /**
     * The port InfluxDB is listening on.
     */
    port: number | undefined;
    /**
     * ARN of the Secrets Manager secret holding the InfluxDB auth parameters.
     */
    influxAuthParametersSecretArn: string | undefined;
    /**
     * The compute instance type backing the DB instance.
     */
    dbInstanceType: influxdb.DbInstanceType | undefined;
    /**
     * The allocated storage, in GiB.
     */
    allocatedStorage: number | undefined;
    /**
     * The subnets the DB instance is attached to.
     */
    vpcSubnetIds: string[];
    /**
     * Current tags reported for the DB instance.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon Timestream for InfluxDB DB instance — a managed, single-tenant
 * InfluxDB engine for time-series workloads.
 *
 * `DbInstance` owns the instance's lifecycle and its mutable configuration
 * (instance type, storage, port, parameter group, log delivery, deployment
 * type, and tags). Networking (subnets, security groups), the initial
 * credentials, organization, and bucket are fixed at creation.
 *
 * :::caution
 * Provisioning a DB instance takes ~15–20 minutes and incurs EC2-backed cost.
 * :::
 * ### Creating DB Instances
 * **Example:** Basic InfluxDB Instance
 * ```typescript
 * import * as Timestream from "alchemy/AWS/Timestream";
 *
 * const influx = yield* Timestream.DbInstance("Influx", {
 *   name: "my-influx",
 *   dbInstanceType: "db.influx.medium",
 *   allocatedStorage: 20,
 *   vpcSubnetIds: [subnetA.subnetId, subnetB.subnetId],
 *   vpcSecurityGroupIds: [securityGroup.groupId],
 *   password: Redacted.make("super-secret-password"),
 * });
 * ```
 *
 * @resource
 */
export declare const DbInstance: import("../../Resource.ts").ResourceClass<DbInstance>;
declare const DbInstanceProvisioningFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "DbInstanceProvisioningFailed";
} & Readonly<A>;
/**
 * A DB instance whose asynchronous provisioning converged to a terminal
 * failure status (`FAILED` / `REBOOT_FAILED`).
 */
export declare class DbInstanceProvisioningFailed extends DbInstanceProvisioningFailed_base<{
    readonly identifier: string;
    readonly status: string;
}> {
}
export declare const DbInstanceProvider: () => import("effect/Layer").Layer<Provider.Provider<DbInstance>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=DbInstance.d.ts.map