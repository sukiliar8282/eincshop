import * as ec2 from "@distilled.cloud/aws/ec2";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, createTagsList, diffTags } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
export const NetworkAclId = (id) => `acl-${id}`;
/**
 * A network ACL — a stateless firewall that controls inbound and outbound
 * traffic at the *subnet* level, evaluated as an ordered list of numbered
 * allow/deny rules.
 *
 * Unlike security groups (which are stateful and attach to interfaces), a
 * network ACL is associated with subnets and evaluates return traffic
 * independently, so you typically pair each inbound rule with a matching
 * ephemeral-port outbound rule. The ACL itself only takes `vpcId` and `tags`;
 * the actual rules live in `NetworkAclEntry` resources and subnet attachments
 * in `NetworkAclAssociation` resources. Changing `vpcId` replaces the ACL.
 *
 * ### Creating Network ACLs
 * **Example:** Basic Network ACL
 * ```typescript
 * const acl = yield* AWS.EC2.NetworkAcl("PrivateNetworkAcl", {
 *   vpcId: vpc.vpcId,
 *   tags: { Name: "private-nacl" },
 * });
 * ```
 * This creates an empty custom ACL in the VPC — it starts with only the implicit
 * default-deny rules, so until you add entries it blocks all traffic on any
 * subnet you associate with it.
 *
 * ### Composing Rules and Associations
 * A network ACL is only useful once you attach rules and point subnets at it.
 * The typical pattern is one `NetworkAcl`, several `NetworkAclEntry` rules, and
 * one `NetworkAclAssociation` per subnet.
 * **Example:** Network ACL with an Inbound Rule and Subnet Association
 * ```typescript
 * const acl = yield* AWS.EC2.NetworkAcl("PrivateNetworkAcl", {
 *   vpcId: vpc.vpcId,
 * });
 *
 * const allowVpc = yield* AWS.EC2.NetworkAclEntry("AllowVpc", {
 *   networkAclId: acl.networkAclId,
 *   ruleNumber: 100,
 *   protocol: "-1",
 *   ruleAction: "allow",
 *   egress: false,
 *   cidrBlock: "10.0.0.0/16",
 * });
 *
 * const association = yield* AWS.EC2.NetworkAclAssociation("SubnetAssoc", {
 *   networkAclId: acl.networkAclId,
 *   subnetId: privateSubnet.subnetId,
 * });
 * ```
 * The entry allows all traffic from within the VPC CIDR and the association
 * makes the subnet use this ACL instead of the VPC default. Build up the full
 * rule set by adding more `NetworkAclEntry` resources with increasing
 * `ruleNumber`s.
 *
 * @resource
 */
export const NetworkAcl = Resource("AWS.EC2.NetworkAcl");
export const NetworkAclProvider = () => Provider.effect(NetworkAcl, Effect.gen(function* () {
    const createTags = Effect.fn(function* (id, tags) {
        return {
            Name: id,
            ...(yield* createInternalTags(id)),
            ...tags,
        };
    });
    const describeNetworkAcl = (networkAclId) => ec2.describeNetworkAcls({ NetworkAclIds: [networkAclId] }).pipe(Effect.map((r) => r.NetworkAcls?.[0]), Effect.flatMap((acl) => acl
        ? Effect.succeed(acl)
        : Effect.fail(new Error(`Network ACL ${networkAclId} not found`))));
    const toAttrs = Effect.fn(function* (acl) {
        const { accountId, region } = yield* AWSEnvironment.current;
        return {
            networkAclId: acl.NetworkAclId,
            networkAclArn: `arn:aws:ec2:${region}:${accountId}:network-acl/${acl.NetworkAclId}`,
            vpcId: acl.VpcId,
            isDefault: acl.IsDefault ?? false,
            ownerId: acl.OwnerId,
            entries: acl.Entries?.map((e) => ({
                ruleNumber: e.RuleNumber,
                protocol: e.Protocol,
                ruleAction: e.RuleAction,
                egress: e.Egress,
                cidrBlock: e.CidrBlock,
                ipv6CidrBlock: e.Ipv6CidrBlock,
                icmpTypeCode: e.IcmpTypeCode
                    ? {
                        code: e.IcmpTypeCode.Code,
                        type: e.IcmpTypeCode.Type,
                    }
                    : undefined,
                portRange: e.PortRange
                    ? {
                        from: e.PortRange.From,
                        to: e.PortRange.To,
                    }
                    : undefined,
            })),
            associations: acl.Associations?.map((a) => ({
                networkAclAssociationId: a.NetworkAclAssociationId,
                networkAclId: a.NetworkAclId,
                subnetId: a.SubnetId,
            })),
        };
    });
    return {
        stables: ["networkAclId", "networkAclArn", "ownerId", "isDefault"],
        read: Effect.fn(function* ({ output }) {
            if (!output)
                return undefined;
            const acl = yield* describeNetworkAcl(output.networkAclId);
            return yield* toAttrs(acl);
        }),
        list: () => Effect.gen(function* () {
            // Filter default NACLs at the API: every VPC has one, they
            // cannot be deleted, and paging through them under a concurrent
            // suite stalls the list test past the per-test timeout — which
            // then skips destroy and leaks the custom ACL + VPC.
            const acls = yield* ec2.describeNetworkAcls
                .pages({
                Filters: [{ Name: "default", Values: ["false"] }],
            })
                .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.NetworkAcls ?? []).filter((acl) => acl.NetworkAclId != null && acl.IsDefault !== true))));
            return yield* Effect.forEach(acls, (acl) => toAttrs(acl));
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return;
            // VPC change requires replacement
            if (news.vpcId !== olds.vpcId) {
                return { action: "replace" };
            }
            // Tags can be updated in-place
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const desiredTags = yield* createTags(id, news.tags);
            // Observe — find the NACL via cached id, else fall through to create.
            let acl;
            if (output?.networkAclId) {
                const lookup = yield* ec2
                    .describeNetworkAcls({ NetworkAclIds: [output.networkAclId] })
                    .pipe(Effect.catchTag("InvalidNetworkAclID.NotFound", () => Effect.succeed({ NetworkAcls: [] })));
                acl = lookup.NetworkAcls?.[0];
            }
            // Ensure — create the NACL when missing.
            if (acl === undefined) {
                yield* session.note("Creating Network ACL...");
                const result = yield* ec2.createNetworkAcl({
                    VpcId: news.vpcId,
                    TagSpecifications: [
                        {
                            ResourceType: "network-acl",
                            Tags: createTagsList(desiredTags),
                        },
                    ],
                    DryRun: false,
                });
                const newAclId = result.NetworkAcl.NetworkAclId;
                yield* session.note(`Network ACL created: ${newAclId}`);
                acl = yield* describeNetworkAcl(newAclId);
            }
            const networkAclId = acl.NetworkAclId;
            // Sync tags — observed cloud tags vs desired.
            const currentTags = Object.fromEntries((acl.Tags ?? []).map((t) => [t.Key, t.Value]));
            const { removed, upsert } = diffTags(currentTags, desiredTags);
            if (removed.length > 0) {
                yield* ec2.deleteTags({
                    Resources: [networkAclId],
                    Tags: removed.map((key) => ({ Key: key })),
                    DryRun: false,
                });
            }
            if (upsert.length > 0) {
                yield* ec2.createTags({
                    Resources: [networkAclId],
                    Tags: upsert,
                    DryRun: false,
                });
            }
            // Re-read final state.
            const final = yield* describeNetworkAcl(networkAclId);
            return yield* toAttrs(final);
        }),
        delete: Effect.fn(function* ({ output, session }) {
            const networkAclId = output.networkAclId;
            yield* session.note(`Deleting Network ACL: ${networkAclId}`);
            yield* ec2
                .deleteNetworkAcl({
                NetworkAclId: networkAclId,
                DryRun: false,
            })
                .pipe(Effect.catchTag("InvalidNetworkAclID.NotFound", () => Effect.void), 
            // Retry on dependency violations (e.g., associations still being removed)
            Effect.retry({
                while: (e) => {
                    return e._tag === "DependencyViolation";
                },
                schedule: Schedule.max([
                    Schedule.exponential(1000, 1.5),
                    Schedule.recurs(15),
                ]).pipe(Schedule.tap(({ attempt }) => session.note(`Waiting for dependencies to clear... (attempt ${attempt})`))),
            }));
            yield* session.note(`Network ACL ${networkAclId} deleted`);
        }),
    };
}));
//# sourceMappingURL=NetworkAcl.js.map