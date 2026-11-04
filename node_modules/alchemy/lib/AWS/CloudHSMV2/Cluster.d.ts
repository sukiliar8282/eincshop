import * as cloudhsm from "@distilled.cloud/aws/cloudhsm-v2";
import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ClusterProps {
    /**
     * Type of HSM the cluster hosts, e.g. `"hsm2m.medium"` (current
     * generation) or `"hsm1.medium"` (legacy). Changing the HSM type replaces
     * the cluster.
     */
    hsmType: string;
    /**
     * IDs of the subnets the cluster's HSMs may be placed into. Each subnet
     * must be in a different Availability Zone of the same VPC. Changing the
     * subnets replaces the cluster.
     */
    subnetIds: string[];
    /**
     * ID (or, cross-account, the full ARN) of a cluster backup to restore the
     * new cluster from. Changing the source backup replaces the cluster.
     */
    sourceBackupId?: string;
    /**
     * IP address type of the cluster's endpoints — `"IPV4"` or `"DUALSTACK"`.
     * Changing the network type replaces the cluster.
     * @default "IPV4"
     */
    networkType?: cloudhsm.NetworkType;
    /**
     * Whether the cluster runs in `"FIPS"` or `"NON_FIPS"` mode. Changing the
     * mode replaces the cluster.
     * @default "FIPS"
     */
    mode?: cloudhsm.ClusterMode;
    /**
     * How long automatic backups of the cluster are retained (e.g. `"30 days"`
     * or `Duration.days(30)`; a bare number is milliseconds). Converted to
     * whole days on the wire. Updated in place via ModifyCluster.
     * @default 90 days
     */
    backupRetention?: Duration.Input;
    /**
     * User-defined tags for the cluster.
     */
    tags?: Record<string, string>;
}
export interface Cluster extends Resource<"AWS.CloudHSMV2.Cluster", ClusterProps, {
    /**
     * The unique identifier of the cluster.
     */
    clusterId: string;
    /**
     * Current state of the cluster (e.g. `UNINITIALIZED`, `ACTIVE`).
     */
    state: string;
    /**
     * The type of HSM in the cluster (e.g. `hsm2m.medium`).
     */
    hsmType: string;
    /**
     * The FIPS mode of the cluster (`FIPS` or `NON_FIPS`).
     */
    mode: string | undefined;
    /**
     * The network type of the cluster (`IPV4` or `DUALSTACK`).
     */
    networkType: string | undefined;
    /**
     * The VPC the cluster's HSMs live in.
     */
    vpcId: string | undefined;
    /**
     * The security group CloudHSM created for the cluster's ENIs.
     */
    securityGroup: string | undefined;
    /**
     * The subnets (one per AZ) the cluster spans.
     */
    subnetIds: string[];
    /**
     * The certificate signing request to sign when initializing the cluster
     * (present while `UNINITIALIZED`).
     */
    clusterCsr: string | undefined;
    /**
     * How many days backups are retained.
     */
    backupRetentionDays: number | undefined;
    /**
     * Current tags on the cluster.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS CloudHSM cluster — a fleet of FIPS-validated, single-tenant
 * hardware security modules (HSMs) inside your VPC.
 *
 * A fresh cluster provisions to the `UNINITIALIZED` state in a few minutes
 * and holds no HSMs; add {@link Hsm} resources to place HSMs into its
 * subnets' Availability Zones (each HSM is billed hourly). Activating the
 * cluster (signing the cluster CSR and calling InitializeCluster) is an
 * offline certificate-authority ceremony that stays out of band — the
 * `clusterCsr` attribute exposes the CSR to sign.
 * ### Creating a Cluster
 * **Example:** Cluster Spanning Two Availability Zones
 * ```typescript
 * const cluster = yield* Cluster("HsmCluster", {
 *   hsmType: "hsm2m.medium",
 *   subnetIds: [subnetA.subnetId, subnetB.subnetId],
 * });
 * ```
 *
 * **Example:** Non-FIPS Cluster with Custom Backup Retention
 * ```typescript
 * const cluster = yield* Cluster("HsmCluster", {
 *   hsmType: "hsm2m.medium",
 *   subnetIds: [subnetA.subnetId, subnetB.subnetId],
 *   mode: "NON_FIPS",
 *   backupRetention: "30 days",
 * });
 * ```
 *
 * ### Adding HSMs
 * **Example:** Cluster with One HSM
 * ```typescript
 * const cluster = yield* Cluster("HsmCluster", {
 *   hsmType: "hsm2m.medium",
 *   subnetIds: [subnetA.subnetId, subnetB.subnetId],
 * });
 * const hsm = yield* Hsm("Primary", {
 *   clusterId: cluster.clusterId,
 *   availabilityZone: "us-west-2a",
 * });
 * ```
 *
 * @resource
 */
export declare const Cluster: import("../../Resource.ts").ResourceClass<Cluster>;
export declare const ClusterProvider: () => import("effect/Layer").Layer<Provider.Provider<Cluster>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Cluster.d.ts.map