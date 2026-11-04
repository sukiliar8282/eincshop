import * as opensearch from "@distilled.cloud/aws/opensearch";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { PolicyDocument } from "../IAM/Policy.ts";
import type { Providers } from "../Providers.ts";
export interface DomainClusterConfig {
    /**
     * Instance type of the data nodes, e.g. `"t3.small.search"` (the cheapest
     * general-purpose type) or `"r7g.large.search"`.
     * @default "t3.small.search"
     */
    instanceType?: opensearch.OpenSearchPartitionInstanceType;
    /**
     * Number of data nodes in the cluster.
     * @default 1
     */
    instanceCount?: number;
    /**
     * Whether dedicated master nodes are enabled.
     */
    dedicatedMasterEnabled?: boolean;
    /**
     * Instance type of the dedicated master nodes.
     */
    dedicatedMasterType?: opensearch.OpenSearchPartitionInstanceType;
    /**
     * Number of dedicated master nodes (3 or 5 recommended).
     */
    dedicatedMasterCount?: number;
    /**
     * Whether data is distributed across multiple Availability Zones.
     */
    zoneAwarenessEnabled?: boolean;
    /**
     * Number of Availability Zones (2 or 3) when zone awareness is enabled.
     */
    availabilityZoneCount?: number;
    /**
     * Whether UltraWarm storage is enabled. Not supported on t2/t3 instances.
     */
    warmEnabled?: boolean;
    /**
     * Instance type of the UltraWarm nodes.
     */
    warmType?: opensearch.OpenSearchWarmPartitionInstanceType;
    /**
     * Number of UltraWarm nodes.
     */
    warmCount?: number;
    /**
     * Whether the domain runs in Multi-AZ with Standby mode.
     */
    multiAZWithStandbyEnabled?: boolean;
}
export interface DomainEbsOptions {
    /**
     * Whether EBS volumes are attached to the data nodes. Required for
     * EBS-only instance types like `t3.small.search`.
     * @default true
     */
    enabled?: boolean;
    /**
     * EBS volume type.
     * @default "gp3"
     */
    volumeType?: opensearch.VolumeType;
    /**
     * EBS volume size in GiB per data node.
     * @default 10
     */
    volumeSize?: number;
    /**
     * Provisioned IOPS (io1/gp3 volumes).
     */
    iops?: number;
    /**
     * Provisioned throughput in MiB/s (gp3 volumes).
     */
    throughput?: number;
}
export interface DomainEncryptionAtRestOptions {
    /**
     * Whether encryption at rest is enabled. Enabling on an existing domain is
     * an in-place update; DISABLING it is not supported and replaces the
     * domain. Not supported on t2 instance types.
     * @default true when `encryptionAtRest` is specified
     */
    enabled?: boolean;
    /**
     * Customer-managed KMS key ID used for encryption.
     * @default the AWS-owned aws/es key
     */
    kmsKeyId?: string;
}
export interface DomainEndpointOptionsProps {
    /**
     * Whether all traffic to the domain must arrive over HTTPS.
     */
    enforceHTTPS?: boolean;
    /**
     * Minimum TLS version for HTTPS connections, e.g.
     * `"Policy-Min-TLS-1-2-2019-07"`.
     */
    tlsSecurityPolicy?: opensearch.TLSSecurityPolicy;
    /**
     * Whether a custom endpoint is enabled for the domain.
     */
    customEndpointEnabled?: boolean;
    /**
     * Fully qualified custom endpoint, e.g. `"search.example.com"`.
     */
    customEndpoint?: string;
    /**
     * ACM certificate ARN for the custom endpoint.
     */
    customEndpointCertificateArn?: string;
}
export interface DomainSnapshotOptions {
    /**
     * Hour of the day (0-23, UTC) when automated snapshots are taken.
     */
    automatedSnapshotStartHour?: number;
}
export interface DomainVpcOptions {
    /**
     * Subnet IDs the domain's endpoints are placed into. One subnet unless
     * zone awareness is enabled.
     */
    subnetIds?: string[];
    /**
     * Security group IDs applied to the domain's network interfaces.
     */
    securityGroupIds?: string[];
}
export interface DomainProps {
    /**
     * Name of the domain. 3-28 characters; lowercase letters, numbers, and
     * hyphens; must start with a lowercase letter. If omitted, a deterministic
     * physical name is generated. Changing the name replaces the domain.
     */
    domainName?: string;
    /**
     * Engine version, e.g. `"OpenSearch_2.19"` or `"Elasticsearch_7.10"`.
     * Raising the version triggers an in-place engine upgrade.
     * @default the latest OpenSearch version
     */
    engineVersion?: string;
    /**
     * Cluster topology: data node type/count, dedicated masters, zone
     * awareness, and UltraWarm.
     * @default a single t3.small.search data node
     */
    clusterConfig?: DomainClusterConfig;
    /**
     * EBS storage attached to each data node.
     * @default 10 GiB gp3
     */
    ebsOptions?: DomainEbsOptions;
    /**
     * IAM resource-based access policy document controlling who can reach the
     * domain endpoint, either as a structured {@link PolicyDocument} or a raw
     * JSON string (escape hatch / adoption of pre-existing policies).
     */
    accessPolicies?: PolicyDocument | string;
    /**
     * IP address type of the endpoint — `"ipv4"` or `"dualstack"`.
     */
    ipAddressType?: opensearch.IPAddressType;
    /**
     * VPC placement for the domain endpoints. Omit for a public endpoint.
     */
    vpcOptions?: DomainVpcOptions;
    /**
     * Encryption of data at rest. Disabling on an existing domain replaces it.
     */
    encryptionAtRest?: DomainEncryptionAtRestOptions;
    /**
     * Whether node-to-node (in transit) encryption is enabled. Disabling on an
     * existing domain replaces it.
     */
    nodeToNodeEncryption?: boolean;
    /**
     * Advanced OpenSearch settings, e.g.
     * `{ "rest.action.multi.allow_explicit_index": "true" }`.
     */
    advancedOptions?: Record<string, string>;
    /**
     * HTTPS enforcement, TLS policy, and custom endpoint configuration.
     */
    domainEndpointOptions?: DomainEndpointOptionsProps;
    /**
     * Automated snapshot configuration.
     */
    snapshotOptions?: DomainSnapshotOptions;
    /**
     * User-defined tags for the domain.
     */
    tags?: Record<string, string>;
}
export interface Domain extends Resource<"AWS.OpenSearch.Domain", DomainProps, {
    /**
     * Name of the domain.
     */
    domainName: string;
    /**
     * ARN of the domain.
     */
    domainArn: string;
    /**
     * Unique identifier of the domain (`account-id/domain-name`).
     */
    domainId: string;
    /**
     * Engine version running on the domain (e.g. `OpenSearch_2.19`).
     */
    engineVersion: string | undefined;
    /**
     * Domain-specific HTTPS endpoint for search and index requests.
     */
    endpoint: string | undefined;
    /**
     * Whether domain creation has completed.
     */
    created: boolean;
    /**
     * Whether a configuration change is currently being applied.
     */
    processing: boolean;
    /**
     * Tags on the domain.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon OpenSearch Service domain — a managed OpenSearch/Elasticsearch
 * cluster with a search/HTTP endpoint.
 *
 * Domains take roughly 15-25 minutes to provision (and about as long for
 * blue/green configuration changes) and are billed per instance-hour while
 * they exist. Destroy domains you are not using.
 * ### Creating a Domain
 * **Example:** Minimal Domain
 * ```typescript
 * // A single t3.small.search node with 10 GiB of gp3 EBS storage.
 * const domain = yield* Domain("Search", {});
 * ```
 *
 * **Example:** Encrypted Domain with Access Policy
 * ```typescript
 * const domain = yield* Domain("Search", {
 *   engineVersion: "OpenSearch_2.19",
 *   clusterConfig: { instanceType: "t3.small.search", instanceCount: 1 },
 *   ebsOptions: { volumeType: "gp3", volumeSize: 10 },
 *   encryptionAtRest: { enabled: true },
 *   nodeToNodeEncryption: true,
 *   domainEndpointOptions: {
 *     enforceHTTPS: true,
 *     tlsSecurityPolicy: "Policy-Min-TLS-1-2-2019-07",
 *   },
 *   accessPolicies: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { AWS: `arn:aws:iam::${accountId}:root` },
 *         Action: ["es:*"],
 *         Resource: `arn:aws:es:${region}:${accountId}:domain/*`,
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * ### Multi-AZ Cluster
 * **Example:** Zone-Aware Cluster
 * ```typescript
 * const domain = yield* Domain("Search", {
 *   clusterConfig: {
 *     instanceType: "r7g.large.search",
 *     instanceCount: 2,
 *     zoneAwarenessEnabled: true,
 *     availabilityZoneCount: 2,
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Domain: import("../../Resource.ts").ResourceClass<Domain>;
export declare const DomainProvider: () => import("effect/Layer").Layer<Provider.Provider<Domain>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Domain.d.ts.map