import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { NetworkAclId } from "./NetworkAcl.ts";
import type { SubnetId } from "./Subnet.ts";
export type NetworkAclAssociationId<ID extends string = string> = `aclassoc-${ID}`;
export declare const NetworkAclAssociationId: <ID extends string>(id: ID) => ID & NetworkAclAssociationId<ID>;
export interface NetworkAclAssociationProps {
    /**
     * The ID of the new network ACL to associate with the subnet.
     */
    networkAclId: NetworkAclId;
    /**
     * The ID of the subnet to associate with the network ACL.
     */
    subnetId: SubnetId;
}
export interface NetworkAclAssociation extends Resource<"AWS.EC2.NetworkAclAssociation", NetworkAclAssociationProps, {
    /**
     * The ID of the association between the network ACL and the subnet.
     */
    associationId: NetworkAclAssociationId;
    /**
     * The ID of the network ACL the subnet is associated with.
     */
    networkAclId: NetworkAclId;
    /**
     * The ID of the associated subnet.
     */
    subnetId: SubnetId;
}, never, Providers> {
}
/**
 * Associates a subnet with a `NetworkAcl`, replacing whichever ACL the subnet
 * currently uses (every subnet is always associated with exactly one network
 * ACL — the VPC's default until you point it at a custom one).
 *
 * Changing `subnetId` replaces the association, while changing only
 * `networkAclId` re-points the same subnet at a different ACL in place. On
 * delete, the subnet is reverted to the VPC's default network ACL so it is never
 * left without one.
 *
 * ### Associating Subnets
 * A subnet starts out attached to the VPC's default ACL; this resource moves it
 * onto a custom ACL so the rules you defined with `NetworkAclEntry` take effect
 * for that subnet.
 * **Example:** Move a Subnet onto a Custom Network ACL
 * ```typescript
 * const association = yield* AWS.EC2.NetworkAclAssociation("PrivateSubnetNaclAssoc", {
 *   networkAclId: privateNetworkAcl.networkAclId,
 *   subnetId: privateSubnet.subnetId,
 * });
 * ```
 * This detaches the subnet from the default ACL and attaches it to your custom
 * ACL; destroying the association automatically reverts the subnet to the
 * default ACL, which is the safe way to "remove" a custom ACL from a subnet.
 *
 * @resource
 */
export declare const NetworkAclAssociation: import("../../Resource.ts").ResourceClass<NetworkAclAssociation>;
export declare const NetworkAclAssociationProvider: () => import("effect/Layer").Layer<Provider.Provider<NetworkAclAssociation>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=NetworkAclAssociation.d.ts.map