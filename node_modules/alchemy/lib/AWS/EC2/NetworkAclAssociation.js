import * as ec2 from "@distilled.cloud/aws/ec2";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { getDefaultVpcScope } from "./defaultVpcScope.js";
export const NetworkAclAssociationId = (id) => `aclassoc-${id}`;
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
export const NetworkAclAssociation = Resource("AWS.EC2.NetworkAclAssociation");
export const NetworkAclAssociationProvider = () => Provider.effect(NetworkAclAssociation, Effect.gen(function* () {
    const findAssociation = (subnetId) => ec2
        .describeNetworkAcls({
        Filters: [{ Name: "association.subnet-id", Values: [subnetId] }],
    })
        .pipe(Effect.map((r) => {
        const acl = r.NetworkAcls?.[0];
        const assoc = acl?.Associations?.find((a) => a.SubnetId === subnetId);
        return assoc
            ? {
                associationId: assoc.NetworkAclAssociationId,
                networkAclId: assoc.NetworkAclId,
                subnetId: assoc.SubnetId,
            }
            : undefined;
    }));
    return NetworkAclAssociation.Provider.of({
        stables: ["subnetId"],
        // NACL associations are embedded in describeNetworkAcls. Each NetworkAcl
        // carries an Associations[] of {subnet, acl, associationId}; flatten
        // every page's associations to enumerate them all in the region.
        list: () => Effect.gen(function* () {
            // Associations on the default VPC's default network ACL are
            // furniture AWS auto-provisions for its subnets; never
            // census/nuke them. Associations to user-created (non-default)
            // ACLs inside the default VPC are still listed.
            const defaultVpc = yield* getDefaultVpcScope;
            return yield* ec2.describeNetworkAcls.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.NetworkAcls ?? [])
                .filter((acl) => defaultVpc.vpcId === undefined ||
                !(acl.VpcId === defaultVpc.vpcId && acl.IsDefault))
                .flatMap((acl) => (acl.Associations ?? [])
                .filter((a) => a.NetworkAclAssociationId != null &&
                a.NetworkAclId != null &&
                a.SubnetId != null)
                .map((a) => ({
                associationId: a.NetworkAclAssociationId,
                networkAclId: a.NetworkAclId,
                subnetId: a.SubnetId,
            }))))));
        }),
        read: Effect.fn(function* ({ olds }) {
            if (!olds)
                return undefined;
            const assoc = yield* findAssociation(olds.subnetId);
            if (!assoc) {
                return yield* Effect.fail(new Error(`Network ACL Association not found for subnet ${olds.subnetId}`));
            }
            return {
                associationId: assoc.associationId,
                networkAclId: assoc.networkAclId,
                subnetId: assoc.subnetId,
            };
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return;
            // Subnet change requires replacement
            if (news.subnetId !== olds.subnetId) {
                return { action: "replace" };
            }
            // Network ACL change can be done via replaceNetworkAclAssociation
        }),
        reconcile: Effect.fn(function* ({ news, session }) {
            // Observe — find the subnet's current association. EC2 guarantees
            // every subnet always has exactly one NACL association, so the
            // lookup always returns something for a live subnet.
            const currentAssoc = yield* findAssociation(news.subnetId);
            if (!currentAssoc) {
                return yield* Effect.fail(new Error(`No existing Network ACL Association found for subnet ${news.subnetId}`));
            }
            // Sync — if the subnet already points at the desired NACL, the
            // association is already correct and we just report it. Otherwise
            // ReplaceNetworkAclAssociation atomically swaps it.
            if (currentAssoc.networkAclId === news.networkAclId) {
                return {
                    associationId: currentAssoc.associationId,
                    networkAclId: news.networkAclId,
                    subnetId: news.subnetId,
                };
            }
            yield* session.note(`Associating subnet ${news.subnetId} with NACL ${news.networkAclId}...`);
            const result = yield* ec2.replaceNetworkAclAssociation({
                AssociationId: currentAssoc.associationId,
                NetworkAclId: news.networkAclId,
                DryRun: false,
            });
            const newAssociationId = result.NewAssociationId;
            yield* session.note(`Network ACL Association: ${newAssociationId}`);
            return {
                associationId: newAssociationId,
                networkAclId: news.networkAclId,
                subnetId: news.subnetId,
            };
        }),
        delete: Effect.fn(function* ({ olds, output, session }) {
            yield* session.note(`Deleting Network ACL Association...`);
            // When deleting, we need to associate the subnet back to the default NACL
            // Find the default NACL for the VPC
            const subnetResult = yield* ec2
                .describeSubnets({
                SubnetIds: [olds.subnetId],
            })
                .pipe(
            // If subnet is already deleted, association is gone too
            Effect.catchTag("InvalidSubnetID.NotFound", () => Effect.succeed({ Subnets: [] })));
            const vpcId = subnetResult.Subnets?.[0]?.VpcId;
            if (!vpcId) {
                // Subnet is already deleted, so the association is gone
                yield* session.note(`Subnet already deleted, association is gone`);
                return;
            }
            const defaultAcl = yield* ec2.describeNetworkAcls
                .items({
                Filters: [
                    { Name: "vpc-id", Values: [vpcId] },
                    { Name: "default", Values: ["true"] },
                ],
            })
                .pipe(Stream.runHead, Effect.map(Option.getOrUndefined));
            const defaultAclId = defaultAcl?.NetworkAclId;
            if (defaultAclId && defaultAclId !== olds.networkAclId) {
                // Replace with default NACL
                yield* ec2
                    .replaceNetworkAclAssociation({
                    AssociationId: output.associationId,
                    NetworkAclId: defaultAclId,
                    DryRun: false,
                })
                    .pipe(Effect.catchTag("InvalidAssociationID.NotFound", () => Effect.void));
                yield* session.note(`Network ACL Association reverted to default`);
            }
            else {
                yield* session.note(`Already using default Network ACL, nothing to do`);
            }
        }),
    });
}));
//# sourceMappingURL=NetworkAclAssociation.js.map