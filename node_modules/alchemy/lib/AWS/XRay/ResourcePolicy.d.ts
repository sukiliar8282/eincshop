import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ResourcePolicyProps {
    /**
     * Name of the resource policy. Must be unique within the account (each
     * account holds at most 5 X-Ray resource policies).
     *
     * Changing the name replaces the policy.
     * @default ${app}-${stage}-${id}
     */
    policyName?: string;
    /**
     * The IAM resource-based policy document (JSON, maximum 5 KB) granting
     * one or more Amazon Web Services services and accounts permission to
     * access X-Ray — e.g. allowing SNS active tracing to call
     * `xray:PutTraceSegments`. Updated in place.
     */
    policyDocument: string;
    /**
     * Skip the check that prevents locking yourself out of the ability to
     * change the policy in the future.
     * @default false
     */
    bypassPolicyLockoutCheck?: boolean;
}
export interface ResourcePolicy extends Resource<"AWS.XRay.ResourcePolicy", ResourcePolicyProps, {
    /**
     * Name of the resource policy.
     */
    policyName: string;
    /**
     * Revision id of the policy document, changed on every update.
     */
    policyRevisionId: string | undefined;
}, never, Providers> {
}
/**
 * An X-Ray resource policy — an account-level, resource-based IAM policy
 * that grants other Amazon Web Services services and accounts access to
 * X-Ray, e.g. allowing SNS active tracing to send trace segments.
 *
 * Resource policies are not taggable; ownership is keyed by the
 * deterministic policy name.
 * ### Creating Resource Policies
 * **Example:** Allow SNS active tracing to send trace data
 * ```typescript
 * import * as XRay from "alchemy/AWS/XRay";
 *
 * const policy = yield* XRay.ResourcePolicy("SnsActiveTracing", {
 *   policyDocument: JSON.stringify({
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { Service: "sns.amazonaws.com" },
 *         Action: ["xray:PutTraceSegments", "xray:GetSamplingRules"],
 *         Resource: "*",
 *       },
 *     ],
 *   }),
 * });
 * ```
 *
 * @resource
 */
export declare const ResourcePolicy: import("../../Resource.ts").ResourceClass<ResourcePolicy>;
export declare const ResourcePolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<ResourcePolicy>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ResourcePolicy.d.ts.map