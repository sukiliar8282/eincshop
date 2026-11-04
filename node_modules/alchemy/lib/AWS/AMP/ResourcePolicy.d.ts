import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ResourcePolicyProps {
    /**
     * Id of the AMP workspace the policy is attached to. A workspace has at
     * most one resource-based policy. Changing the workspace replaces the
     * policy.
     */
    workspaceId: string;
    /**
     * The IAM resource-based policy document (JSON) that grants other
     * principals or accounts access to the workspace (e.g. `aps:RemoteWrite`,
     * `aps:QueryMetrics`). Updated in place.
     */
    policyDocument: string;
}
export interface ResourcePolicy extends Resource<"AWS.AMP.ResourcePolicy", ResourcePolicyProps, {
    workspaceId: string;
    policyStatus: string;
    revisionId: string;
}, never, Providers> {
}
/**
 * The resource-based policy of an Amazon Managed Service for Prometheus
 * workspace — grants cross-account or fine-grained same-account access to
 * the workspace's data plane (remote-write, query). A workspace has at most
 * one.
 *
 * ### Creating a Resource Policy
 * **Example:** Allow Another Account to Query the Workspace
 * ```typescript
 * const workspace = yield* AMP.Workspace("Metrics", {});
 * const policy = yield* AMP.ResourcePolicy("Sharing", {
 *   workspaceId: workspace.workspaceId,
 *   policyDocument: JSON.stringify({
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { AWS: "arn:aws:iam::123456789012:root" },
 *         Action: ["aps:QueryMetrics"],
 *         Resource: workspace.workspaceArn,
 *       },
 *     ],
 *   }),
 * });
 * ```
 *
 * @resource
 */
export declare const ResourcePolicy: import("../../Resource.ts").ResourceClass<ResourcePolicy>;
export declare const ResourcePolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<ResourcePolicy>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ResourcePolicy.d.ts.map