import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ClusterPolicyProps {
    /**
     * Identifier of the DSQL cluster the policy is attached to. A cluster has
     * at most one resource-based policy. Changing the cluster replaces the
     * policy.
     */
    clusterId: string;
    /**
     * The resource-based policy document (JSON) that defines access
     * permissions and conditions for the cluster — e.g. denying
     * `dsql:DbConnect` from outside a VPC, or restricting connections to an
     * AWS Organization. Updated in place.
     */
    policy: string;
    /**
     * Skip the lockout safety check that prevents attaching a policy which
     * would lock the calling principal out of `dsql:PutClusterPolicy` /
     * `dsql:DeleteClusterPolicy` on the cluster.
     * @default false
     */
    bypassPolicyLockoutSafetyCheck?: boolean;
}
export interface ClusterPolicy extends Resource<"AWS.DSQL.ClusterPolicy", ClusterPolicyProps, {
    /** Identifier of the cluster the policy is attached to. */
    clusterId: string;
    /** The policy document attached to the cluster. */
    policy: string;
    /** Version of the attached policy, used for optimistic concurrency. */
    policyVersion: string;
}, never, Providers> {
}
/**
 * The resource-based policy of an Aurora DSQL cluster — controls which
 * principals may perform actions on the cluster (most commonly gating
 * `dsql:DbConnect` / `dsql:DbConnectAdmin` behind VPC or Organization
 * conditions). A cluster has at most one.
 *
 * ### Creating a Cluster Policy
 * **Example:** Block Connections from Outside a VPC
 * ```typescript
 * const cluster = yield* DSQL.Cluster("AppDb", {});
 * const policy = yield* DSQL.ClusterPolicy("VpcOnly", {
 *   clusterId: cluster.clusterId,
 *   policy: JSON.stringify({
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Deny",
 *         Principal: { AWS: "*" },
 *         Action: ["dsql:DbConnect", "dsql:DbConnectAdmin"],
 *         Resource: "*",
 *         Condition: { Null: { "aws:SourceVpc": "true" } },
 *       },
 *     ],
 *   }),
 * });
 * ```
 *
 * **Example:** Restrict Access to an AWS Organization
 * ```typescript
 * const policy = yield* DSQL.ClusterPolicy("OrgOnly", {
 *   clusterId: cluster.clusterId,
 *   policy: JSON.stringify({
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Deny",
 *         Principal: { AWS: "*" },
 *         Action: ["dsql:DbConnect", "dsql:DbConnectAdmin"],
 *         Resource: "*",
 *         Condition: {
 *           StringNotEquals: { "aws:PrincipalOrgID": "o-exampleorgid" },
 *         },
 *       },
 *     ],
 *   }),
 * });
 * ```
 *
 * @resource
 */
export declare const ClusterPolicy: import("../../Resource.ts").ResourceClass<ClusterPolicy>;
export declare const ClusterPolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<ClusterPolicy>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ClusterPolicy.d.ts.map