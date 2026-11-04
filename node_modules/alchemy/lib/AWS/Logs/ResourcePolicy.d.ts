import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { PolicyDocument } from "../IAM/Policy.ts";
import type { Providers } from "../Providers.ts";
export interface ResourcePolicyProps {
    /**
     * Name of the resource policy. The policy name is the identity of the
     * policy within the account and region (put semantics upsert by name).
     * If omitted, a unique name is generated. Changing this value replaces
     * the policy.
     */
    policyName?: string;
    /**
     * The policy document granting an AWS service principal (e.g.
     * `route53.amazonaws.com`, `es.amazonaws.com`) permission to write to
     * CloudWatch Logs, either as a JSON string or a structured document.
     */
    policyDocument: PolicyDocument | string;
}
export interface ResourcePolicy extends Resource<"AWS.Logs.ResourcePolicy", ResourcePolicyProps, {
    policyName: string;
    policyDocument: string;
}, never, Providers> {
}
/**
 * An account-scoped CloudWatch Logs resource policy — grants AWS service
 * principals (Route 53 query logging, API Gateway execution logs, OpenSearch
 * slow logs, ...) permission to deliver logs into your account.
 *
 * :::warning
 * AWS allows at most **10 resource policies per region per account** and the
 * quota cannot be raised. Always use a deterministic `policyName` and destroy
 * policies you no longer need.
 * :::
 * ### Granting Log Delivery
 * **Example:** Allow Route 53 Query Logging
 * ```typescript
 * const policy = yield* ResourcePolicy("Route53QueryLogging", {
 *   policyName: "route53-query-logging",
 *   policyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { Service: "route53.amazonaws.com" },
 *         Action: ["logs:CreateLogStream", "logs:PutLogEvents"],
 *         Resource: `arn:aws:logs:us-east-1:${accountId}:log-group:/aws/route53/*`,
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const ResourcePolicy: import("../../Resource.ts").ResourceClass<ResourcePolicy>;
export declare const ResourcePolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<ResourcePolicy>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ResourcePolicy.d.ts.map