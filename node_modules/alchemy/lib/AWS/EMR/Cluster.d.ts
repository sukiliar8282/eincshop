import * as emr from "@distilled.cloud/aws/emr";
import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * EC2 instance topology for an EMR {@link Cluster} — a master (primary)
 * instance group plus an optional core instance group, using the uniform
 * instance-groups configuration.
 */
export interface ClusterInstancesConfig {
    /**
     * EC2 instance type of the single master (primary) node. Changing this
     * replaces the cluster.
     * @default "m5.xlarge"
     */
    masterInstanceType?: string;
    /**
     * EC2 instance type of the core nodes. Changing this replaces the cluster.
     * @default "m5.xlarge"
     */
    coreInstanceType?: string;
    /**
     * Number of core nodes. `0` launches a master-only cluster. Resizing
     * between non-zero counts is applied in place; crossing the `0` boundary
     * (adding or removing the core group entirely) replaces the cluster.
     * @default 1
     */
    coreInstanceCount?: number;
    /**
     * VPC subnet the cluster instances launch in. Changing the subnet replaces
     * the cluster.
     * @default an EMR-chosen subnet of the account's default VPC
     */
    ec2SubnetId?: string;
    /**
     * EC2 key pair for SSH access to the master node. Changing this replaces
     * the cluster.
     */
    ec2KeyName?: string;
    /**
     * Whether the cluster stays alive (transitions to `WAITING`) after all
     * steps complete rather than auto-terminating. Updateable in place.
     * @default true
     */
    keepJobFlowAliveWhenNoSteps?: boolean;
    /**
     * Whether the cluster's EC2 instances are locked against termination by
     * API calls or user intervention. Updateable in place (and always lifted
     * before the provider terminates the cluster on destroy).
     * @default false
     */
    terminationProtected?: boolean;
    /**
     * Whether EMR automatically replaces unhealthy core/task nodes.
     * Updateable in place.
     */
    unhealthyNodeReplacement?: boolean;
    /**
     * EMR-managed security group for the master node. Changing this replaces
     * the cluster.
     * @default a security group created by EMR
     */
    emrManagedMasterSecurityGroup?: string;
    /**
     * EMR-managed security group for core/task nodes. Changing this replaces
     * the cluster.
     * @default a security group created by EMR
     */
    emrManagedSlaveSecurityGroup?: string;
    /**
     * Additional security groups applied to the master node. Changing these
     * replaces the cluster.
     */
    additionalMasterSecurityGroups?: string[];
    /**
     * Additional security groups applied to core/task nodes. Changing these
     * replaces the cluster.
     */
    additionalSlaveSecurityGroups?: string[];
}
export interface ClusterProps {
    /**
     * Display name of the cluster. If omitted, a deterministic physical name is
     * generated. Changing the name replaces the cluster.
     */
    clusterName?: string;
    /**
     * Amazon EMR release, e.g. `"emr-7.5.0"`. Changing the release replaces the
     * cluster.
     */
    releaseLabel: string;
    /**
     * Applications installed on the cluster, e.g. `["Spark", "Hadoop"]`.
     * Changing the set replaces the cluster.
     */
    applications?: string[];
    /**
     * EC2 instance topology (master/core instance groups, subnet, key pair,
     * security groups).
     */
    instances?: ClusterInstancesConfig;
    /**
     * IAM service role EMR assumes to manage cluster resources, e.g. a role
     * trusting `elasticmapreduce.amazonaws.com`. Changing the role replaces
     * the cluster.
     */
    serviceRole: string;
    /**
     * IAM instance profile (also called the job-flow role or EC2 instance
     * profile) assumed by the cluster's EC2 instances. Changing it replaces
     * the cluster.
     */
    jobFlowRole: string;
    /**
     * S3 URI where cluster logs are written, e.g. `"s3://my-bucket/logs/"`.
     * Changing it replaces the cluster.
     */
    logUri?: string;
    /**
     * Name of an EMR {@link SecurityConfiguration} applied at launch. Changing
     * it replaces the cluster.
     */
    securityConfiguration?: string;
    /**
     * Application configuration overrides (raw EMR `Configuration` objects,
     * e.g. `[{ Classification: "spark-defaults", Properties: {...} }]`).
     * Changing them replaces the cluster.
     */
    configurations?: emr.Configuration[];
    /**
     * Whether all IAM principals in the account can see the cluster.
     * Updateable in place.
     * @default true
     */
    visibleToAllUsers?: boolean;
    /**
     * Size of the EBS root volume (GiB) of each instance. Changing it replaces
     * the cluster.
     */
    ebsRootVolumeSize?: number;
    /**
     * Custom AMI ID for the cluster instances. Changing it replaces the
     * cluster.
     */
    customAmiId?: string;
    /**
     * Number of steps that may execute concurrently (1-256). Updateable in
     * place.
     * @default 1
     */
    stepConcurrencyLevel?: number;
    /**
     * Auto-termination policy — the cluster terminates itself after being idle
     * for the configured duration (60 seconds to 7 days). Updateable in place;
     * removing the prop detaches the policy.
     */
    autoTerminationPolicy?: {
        /**
         * Idle time after which the cluster auto-terminates — e.g. `"1 hour"` or
         * `Duration.hours(1)`. Sent to AWS as whole seconds.
         */
        idleTimeout: Duration.Input;
    };
    /**
     * User-defined tags for the cluster.
     */
    tags?: Record<string, string>;
}
export interface Cluster extends Resource<"AWS.EMR.Cluster", ClusterProps, {
    /** The ID of the cluster (e.g. `j-2AXXXXXXGAPLF`). */
    clusterId: string;
    /** The ARN of the cluster. */
    clusterArn: string;
    /** The name of the cluster. */
    clusterName: string;
    /** The cluster state (e.g. `STARTING`, `RUNNING`, `WAITING`). */
    state: string;
    /** The public DNS name of the primary node, when reachable. */
    masterPublicDnsName: string | undefined;
    /** The tags applied to the cluster. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A provisioned Amazon EMR cluster (job flow) running open-source big-data
 * frameworks such as Apache Spark and Hadoop on EC2 instances.
 *
 * Clusters take roughly 10-15 minutes to reach `WAITING` and bill per
 * instance-hour while they exist. Each cluster needs an EMR service role and
 * an EC2 instance profile (job-flow role); destroy clusters you are not
 * using, or set `autoTerminationPolicy` as a safety net.
 * ### Creating a Cluster
 * **Example:** Spark Cluster in a Default-VPC Subnet
 * ```typescript
 * const cluster = yield* Cluster("Analytics", {
 *   releaseLabel: "emr-7.5.0",
 *   applications: ["Spark", "Hadoop"],
 *   serviceRole: serviceRole.roleName,
 *   jobFlowRole: instanceProfile.instanceProfileName,
 *   logUri: Output.interpolate`s3://${logsBucket.bucketName}/logs/`,
 *   instances: {
 *     masterInstanceType: "m5.xlarge",
 *     coreInstanceType: "m5.xlarge",
 *     coreInstanceCount: 1,
 *     ec2SubnetId: subnetId,
 *   },
 * });
 * ```
 *
 * **Example:** Cluster with an Auto-Termination Safety Net
 * ```typescript
 * const cluster = yield* Cluster("Batch", {
 *   releaseLabel: "emr-7.5.0",
 *   applications: ["Spark"],
 *   serviceRole: serviceRole.roleName,
 *   jobFlowRole: instanceProfile.instanceProfileName,
 *   autoTerminationPolicy: { idleTimeout: "1 hour" },
 *   stepConcurrencyLevel: 4,
 * });
 * ```
 *
 * ### Applying a Security Configuration
 * **Example:** Cluster with Encryption Settings
 * ```typescript
 * const config = yield* SecurityConfiguration("Encryption", {
 *   securityConfiguration: {
 *     EncryptionConfiguration: {
 *       EnableInTransitEncryption: false,
 *       EnableAtRestEncryption: false,
 *     },
 *   },
 * });
 * const cluster = yield* Cluster("Secure", {
 *   releaseLabel: "emr-7.5.0",
 *   serviceRole: serviceRole.roleName,
 *   jobFlowRole: instanceProfile.instanceProfileName,
 *   securityConfiguration: config.securityConfigurationName,
 * });
 * ```
 *
 * @resource
 */
export declare const Cluster: import("../../Resource.ts").ResourceClass<Cluster>;
export declare const ClusterProvider: () => import("effect/Layer").Layer<Provider.Provider<Cluster>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Cluster.d.ts.map