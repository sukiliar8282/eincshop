import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ResourcePolicyProps {
    /**
     * ARN of the OSIS resource (pipeline) the policy is attached to. A
     * resource has at most one resource-based policy. Changing the resource
     * replaces the policy.
     */
    resourceArn: string;
    /**
     * The IAM resource-based policy document (JSON) that grants other
     * principals or accounts access to the resource (e.g. `osis:Ingest`,
     * `osis:CreatePipelineEndpoint`). Updated in place.
     */
    policy: string;
}
export interface ResourcePolicy extends Resource<"AWS.OSIS.ResourcePolicy", ResourcePolicyProps, {
    /**
     * ARN of the resource the policy is attached to.
     */
    resourceArn: string;
    /**
     * The attached policy document (JSON).
     */
    policy: string;
}, never, Providers> {
}
/**
 * The resource-based policy of an Amazon OpenSearch Ingestion (OSIS)
 * pipeline — grants cross-account principals access to the pipeline, e.g.
 * `osis:Ingest` for cross-account ingestion or
 * `osis:CreatePipelineEndpoint` so another account can attach a VPC
 * endpoint. A resource has at most one.
 *
 * ### Creating a Resource Policy
 * **Example:** Allow Another Account to Ingest
 * ```typescript
 * const policy = yield* OSIS.ResourcePolicy("CrossAccountIngest", {
 *   resourceArn: pipeline.pipelineArn,
 *   policy: Output.interpolate`{
 *     "Version": "2012-10-17",
 *     "Statement": [
 *       {
 *         "Effect": "Allow",
 *         "Principal": { "AWS": "arn:aws:iam::123456789012:root" },
 *         "Action": ["osis:Ingest"],
 *         "Resource": "${pipeline.pipelineArn}"
 *       }
 *     ]
 *   }`,
 * });
 * ```
 *
 * @resource
 */
export declare const ResourcePolicy: import("../../Resource.ts").ResourceClass<ResourcePolicy>;
export declare const ResourcePolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<ResourcePolicy>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ResourcePolicy.d.ts.map