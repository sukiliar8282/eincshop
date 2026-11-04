import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface PipelineEndpointVpcOptions {
    /**
     * Subnet IDs the endpoint's network interfaces are placed into. Changing
     * subnets replaces the endpoint.
     */
    subnetIds: string[];
    /**
     * Security group IDs applied to the endpoint's network interfaces.
     * Changing security groups replaces the endpoint.
     */
    securityGroupIds?: string[];
}
export interface PipelineEndpointProps {
    /**
     * ARN of the OSIS pipeline the endpoint ingests into. Changing the
     * pipeline replaces the endpoint.
     */
    pipelineArn: string;
    /**
     * VPC placement for the endpoint. All fields are create-only — any change
     * replaces the endpoint.
     */
    vpcOptions: PipelineEndpointVpcOptions;
}
export interface PipelineEndpoint extends Resource<"AWS.OSIS.PipelineEndpoint", PipelineEndpointProps, {
    /**
     * Id of the pipeline endpoint (`pe-…`), assigned by OSIS on create.
     */
    endpointId: string;
    /**
     * ARN of the pipeline the endpoint ingests into.
     */
    pipelineArn: string;
    /**
     * Endpoint status (e.g. `ACTIVE`, `CREATING`, `REVOKED`).
     */
    status: string;
    /**
     * Id of the VPC the endpoint lives in.
     */
    vpcId: string | undefined;
    /**
     * The VPC-private ingest URL for the endpoint.
     */
    ingestEndpointUrl: string | undefined;
}, never, Providers> {
}
/**
 * A VPC endpoint for an Amazon OpenSearch Ingestion (OSIS) pipeline — lets
 * clients inside a VPC ingest data into a pipeline privately, without
 * traversing the public ingest endpoint.
 *
 * All properties are create-only; any change replaces the endpoint. The
 * endpoint id is assigned by OSIS on create.
 * ### Creating a Pipeline Endpoint
 * **Example:** Private Ingest From a VPC
 * ```typescript
 * const endpoint = yield* OSIS.PipelineEndpoint("Private", {
 *   pipelineArn: pipeline.pipelineArn,
 *   vpcOptions: {
 *     subnetIds: [subnet.subnetId],
 *     securityGroupIds: [securityGroup.securityGroupId],
 *   },
 * });
 * // endpoint.ingestEndpointUrl — the VPC-private ingest URL
 * ```
 *
 * @resource
 */
export declare const PipelineEndpoint: import("../../Resource.ts").ResourceClass<PipelineEndpoint>;
declare const PipelineEndpointCreateFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "OsisPipelineEndpointCreateFailed";
} & Readonly<A>;
/**
 * A pipeline endpoint whose asynchronous create converged to a failed
 * status.
 */
export declare class PipelineEndpointCreateFailed extends PipelineEndpointCreateFailed_base<{
    readonly endpointId: string;
    readonly status: string;
}> {
}
export declare const PipelineEndpointProvider: () => import("effect/Layer").Layer<Provider.Provider<PipelineEndpoint>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
export {};
//# sourceMappingURL=PipelineEndpoint.d.ts.map