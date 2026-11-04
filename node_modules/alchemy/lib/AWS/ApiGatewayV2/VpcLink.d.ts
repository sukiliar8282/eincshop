import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface VpcLinkProps {
    /**
     * Name of the VPC link. If omitted, Alchemy generates a deterministic
     * physical name.
     */
    name?: string;
    /**
     * Subnet IDs the VPC link attaches to. Immutable — changing them
     * triggers a replacement.
     */
    subnetIds: string[];
    /**
     * Security group IDs for the VPC link. Immutable — changing them
     * triggers a replacement.
     */
    securityGroupIds?: string[];
    /**
     * User-defined tags (Alchemy internal tags are merged automatically).
     */
    tags?: Record<string, string>;
}
export interface VpcLink extends Resource<"AWS.ApiGatewayV2.VpcLink", VpcLinkProps, {
    /** The VPC link identifier. */
    vpcLinkId: string;
    /** The VPC link name. */
    name: string;
    /** The subnet IDs. */
    subnetIds: string[];
    /** The security group IDs. */
    securityGroupIds: string[];
    /**
     * The provisioning status (`PENDING`, `AVAILABLE`, `DELETING`,
     * `FAILED`). Provisioning typically takes 1–2 minutes; integrations
     * that reference the link only work once it is `AVAILABLE`.
     */
    status: string | undefined;
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An API Gateway v2 VPC link — lets an HTTP API reach private resources
 * (ALB/NLB listeners, Cloud Map services) inside a VPC.
 *
 * Unlike the v1 VPC link (NLB-only, ~10 min provisioning), the v2 link is
 * subnet/security-group based and provisions in ~1–2 minutes.
 * ### Private integrations
 * **Example:** VPC link + private integration
 * ```typescript
 * const link = yield* ApiGatewayV2.VpcLink("Link", {
 *   subnetIds: [subnetA.subnetId, subnetB.subnetId],
 *   securityGroupIds: [securityGroup.securityGroupId],
 * });
 *
 * yield* ApiGatewayV2.Integration("Private", {
 *   api,
 *   integrationType: "HTTP_PROXY",
 *   integrationUri: listener.listenerArn,
 *   integrationMethod: "ANY",
 *   connectionType: "VPC_LINK",
 *   connectionId: link.vpcLinkId,
 *   payloadFormatVersion: "1.0",
 * });
 * ```
 *
 * @resource
 */
export declare const VpcLink: import("../../Resource.ts").ResourceClass<VpcLink>;
export declare const VpcLinkProvider: () => import("effect/Layer").Layer<Provider.Provider<VpcLink>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=VpcLink.d.ts.map