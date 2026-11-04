import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ZoneVpcAssociationProps {
    /**
     * ID of the private hosted zone to associate the VPC with. Changing this
     * forces replacement.
     */
    hostedZoneId: string;
    /**
     * ID of the VPC to associate. The VPC must have DNS support and DNS
     * hostnames enabled. Changing this forces replacement.
     */
    vpcId: string;
    /**
     * Region the VPC lives in. Changing this forces replacement.
     */
    vpcRegion: string;
    /**
     * Optional comment recorded on the association request.
     */
    comment?: string;
}
export interface ZoneVpcAssociation extends Resource<"AWS.Route53.ZoneVpcAssociation", ZoneVpcAssociationProps, {
    /**
     * ID of the private hosted zone.
     */
    hostedZoneId: string;
    /**
     * ID of the associated VPC.
     */
    vpcId: string;
    /**
     * Region of the associated VPC.
     */
    vpcRegion: string;
}, never, Providers> {
}
/**
 * An association between an additional VPC and a private hosted zone.
 *
 * A private hosted zone is created with one initial VPC (see
 * `HostedZone.vpc`); `ZoneVpcAssociation` attaches further VPCs so their DNS
 * resolvers can answer from the zone. For a VPC in a different account, the
 * zone owner must first create a `VpcAssociationAuthorization` for it.
 *
 * The initial VPC of a private zone cannot be modeled with this resource —
 * Route 53 refuses to disassociate the last VPC from a private zone.
 * ### Associating VPCs
 * **Example:** Attach a Second VPC
 * ```typescript
 * const zone = yield* HostedZone("InternalZone", {
 *   name: "internal.example.com",
 *   privateZone: true,
 *   vpc: { vpcId: primary.vpcId, vpcRegion: "us-west-2" },
 * });
 *
 * const association = yield* ZoneVpcAssociation("SecondaryVpc", {
 *   hostedZoneId: zone.id,
 *   vpcId: secondary.vpcId,
 *   vpcRegion: "us-west-2",
 * });
 * ```
 *
 * @resource
 */
export declare const ZoneVpcAssociation: import("../../Resource.ts").ResourceClass<ZoneVpcAssociation>;
export declare const ZoneVpcAssociationProvider: () => import("effect/Layer").Layer<Provider.Provider<ZoneVpcAssociation>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ZoneVpcAssociation.d.ts.map