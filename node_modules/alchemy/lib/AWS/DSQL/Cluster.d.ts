import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface ClusterProps {
    /**
     * Enables deletion protection. While enabled the cluster cannot be deleted;
     * the provider automatically disables it during delete so `stack.destroy()`
     * always succeeds.
     * @default false
     */
    deletionProtectionEnabled?: boolean;
    /**
     * ARN of a customer-managed KMS key used to encrypt the cluster at rest.
     * Changing the key replaces the cluster.
     * @default an AWS-owned key
     */
    kmsEncryptionKey?: string;
    /**
     * User-defined tags for the cluster.
     */
    tags?: Record<string, string>;
}
export interface Cluster extends Resource<"AWS.DSQL.Cluster", ClusterProps, {
    /** The unique cluster identifier assigned by DSQL. */
    clusterId: string;
    /** The ARN of the cluster. */
    clusterArn: string;
    /** The current status of the cluster, e.g. `ACTIVE`. */
    status: string;
    /**
     * The public cluster endpoint hostname, e.g.
     * `<clusterId>.dsql.<region>.on.aws`. Connect with a Postgres wire client
     * using an IAM-generated auth token as the password.
     */
    endpoint: string;
    /** Whether deletion protection is enabled on the cluster. */
    deletionProtectionEnabled: boolean;
}, never, Providers> {
}
/**
 * An Amazon Aurora DSQL cluster — a serverless, distributed SQL database with
 * active-active high availability and Postgres wire compatibility.
 *
 * Clusters are pay-per-use with no provisioned capacity, so they have
 * excellent test economics. Create is asynchronous (`CREATING` -> `ACTIVE`),
 * usually completing in under a minute; the provider waits for `ACTIVE`
 * (bounded) before returning.
 * ### Creating a Cluster
 * **Example:** Basic Cluster
 * ```typescript
 * const cluster = yield* Cluster("AppDb", {});
 * // connect to cluster.endpoint on port 5432 as user "admin"
 * ```
 *
 * **Example:** Cluster with Deletion Protection
 * ```typescript
 * const cluster = yield* Cluster("AppDb", {
 *   deletionProtectionEnabled: true,
 * });
 * ```
 *
 * **Example:** Cluster with a Customer-Managed KMS Key
 * ```typescript
 * const cluster = yield* Cluster("AppDb", {
 *   kmsEncryptionKey: key.keyArn,
 * });
 * ```
 *
 * @resource
 */
export declare const Cluster: import("../../Resource.ts").ResourceClass<Cluster>;
export declare const ClusterProvider: () => import("effect/Layer").Layer<Provider.Provider<Cluster>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Cluster.d.ts.map