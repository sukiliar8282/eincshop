import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface VpcAssociationAuthorizationProps {
    /**
     * ID of the private hosted zone to authorize the association with. Must be
     * a zone owned by the current account. Changing this forces replacement.
     */
    hostedZoneId: string;
    /**
     * ID of the VPC that is authorized to be associated with the hosted zone
     * (typically a VPC owned by a different AWS account). Changing this forces
     * replacement.
     */
    vpcId: string;
    /**
     * Region the VPC lives in. Changing this forces replacement.
     */
    vpcRegion: string;
}
export interface VpcAssociationAuthorization extends Resource<"AWS.Route53.VpcAssociationAuthorization", VpcAssociationAuthorizationProps, {
    /**
     * ID of the private hosted zone.
     */
    hostedZoneId: string;
    /**
     * ID of the authorized VPC.
     */
    vpcId: string;
    /**
     * Region of the authorized VPC.
     */
    vpcRegion: string;
}, never, Providers> {
}
/**
 * Authorization for a VPC (usually in another AWS account) to be associated
 * with a private hosted zone.
 *
 * Cross-account private-zone association is a two-step handshake: the
 * zone-owning account creates a `VpcAssociationAuthorization` for the foreign
 * VPC, then the VPC-owning account submits the association (see
 * `ZoneVpcAssociation`). Same-account associations don't need an
 * authorization.
 * ### Authorizing Cross-Account Association
 * **Example:** Authorize a VPC
 * ```typescript
 * const authorization = yield* VpcAssociationAuthorization("PeerVpcAuth", {
 *   hostedZoneId: zone.id,
 *   vpcId: "vpc-0123456789abcdef0", // VPC in the other account
 *   vpcRegion: "us-west-2",
 * });
 * ```
 *
 * @resource
 */
export declare const VpcAssociationAuthorization: import("../../Resource.ts").ResourceClass<VpcAssociationAuthorization>;
export declare const VpcAssociationAuthorizationProvider: () => import("effect/Layer").Layer<Provider.Provider<VpcAssociationAuthorization>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=VpcAssociationAuthorization.d.ts.map