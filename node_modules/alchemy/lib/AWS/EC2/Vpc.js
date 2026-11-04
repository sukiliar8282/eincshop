import * as EC2 from "@distilled.cloud/aws/ec2";
import * as ec2 from "@distilled.cloud/aws/ec2";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { isResolved, somePropsAreDifferent } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, createTagsList, diffTags } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
export const VpcId = (value) => value;
/**
 * An Amazon VPC (Virtual Private Cloud) — an isolated virtual network that is
 * the root of any custom AWS networking topology. Subnets, route tables,
 * gateways, security groups, and instances are all created inside a VPC.
 *
 * Changing the `cidrBlock`, `instanceTenancy`, or an IPAM/IPv6 pool replaces
 * the VPC.
 *
 * ### Creating a VPC
 * A VPC is defined by a private IPv4 address range (`cidrBlock`). Pick a block
 * from the RFC 1918 private space (e.g. `10.0.0.0/16`) that is large enough to
 * subdivide into subnets across your Availability Zones.
 *
 * **Example:** Basic VPC
 * ```typescript
 * const vpc = yield* AWS.EC2.Vpc("MyVpc", {
 *   cidrBlock: "10.0.0.0/16",
 * });
 * ```
 *
 * A `/16` gives you 65,536 addresses to carve into subnets — enough headroom
 * for a multi-AZ, multi-tier network. This is the minimal config every other
 * networking resource builds on.
 *
 * **Example:** Allocating IPv4 from an IPAM pool
 * ```typescript
 * const vpc = yield* AWS.EC2.Vpc("MyVpc", {
 *   ipv4IpamPoolId: "ipam-pool-0123456789abcdef0",
 *   ipv4NetmaskLength: 16,
 * });
 * ```
 *
 * Instead of hard-coding `cidrBlock`, let AWS IPAM hand out a non-overlapping
 * range of the requested size. Use this when an organization centrally manages
 * address space to avoid CIDR collisions between accounts.
 *
 * ### DNS Resolution
 * Two independent toggles control DNS behavior inside the VPC. `enableDnsSupport`
 * lets instances resolve names via the Amazon DNS server; `enableDnsHostnames`
 * additionally assigns public DNS hostnames to instances with public IPs.
 *
 * **Example:** Enable DNS support and hostnames
 * ```typescript
 * const vpc = yield* AWS.EC2.Vpc("MyVpc", {
 *   cidrBlock: "10.0.0.0/16",
 *   enableDnsSupport: true,
 *   enableDnsHostnames: true,
 * });
 * ```
 *
 * Enable both when instances need public DNS names or when you rely on private
 * hosted zones and VPC endpoints, which require DNS resolution to function.
 *
 * ### Instance Tenancy
 * **Example:** Dedicated tenancy
 * ```typescript
 * const vpc = yield* AWS.EC2.Vpc("MyVpc", {
 *   cidrBlock: "10.0.0.0/16",
 *   instanceTenancy: "dedicated",
 * });
 * ```
 *
 * Forcing `"dedicated"` tenancy ensures every instance launched in the VPC runs
 * on single-tenant hardware — required by some compliance regimes, but more
 * expensive than the `"default"` shared tenancy. This property cannot be
 * changed after creation without replacing the VPC.
 *
 * ### IPv6 Addressing
 * A VPC can carry an IPv6 `/56` block alongside its IPv4 range. The block can
 * come from Amazon's pool, an IPAM pool, or your own BYOIP pool
 * (`ipv6CidrBlock` + `ipv6Pool`, optionally scoped to a
 * `ipv6CidrBlockNetworkBorderGroup`).
 *
 * **Example:** Amazon-provided IPv6 block
 * ```typescript
 * const vpc = yield* AWS.EC2.Vpc("MyVpc", {
 *   cidrBlock: "10.0.0.0/16",
 *   amazonProvidedIpv6CidrBlock: true,
 * });
 * ```
 *
 * Requests an Amazon-assigned IPv6 `/56`, the simplest way to make a VPC
 * dual-stack. Pair it with IPv6-enabled subnets and an egress-only internet
 * gateway for outbound-only IPv6 connectivity.
 *
 * **Example:** IPv6 from an IPAM pool
 * ```typescript
 * const vpc = yield* AWS.EC2.Vpc("MyVpc", {
 *   cidrBlock: "10.0.0.0/16",
 *   ipv6IpamPoolId: "ipam-pool-0fedcba9876543210",
 *   ipv6NetmaskLength: 56,
 * });
 * ```
 *
 * Draws the IPv6 block from a centrally-managed IPAM pool instead of Amazon's
 * pool, giving you deterministic, organization-governed IPv6 ranges.
 *
 * ### Composing a Network
 * **Example:** VPC with a subnet
 * ```typescript
 * const vpc = yield* AWS.EC2.Vpc("MyVpc", {
 *   cidrBlock: "10.0.0.0/16",
 *   enableDnsSupport: true,
 *   enableDnsHostnames: true,
 * });
 *
 * const subnet = yield* AWS.EC2.Subnet("PublicSubnet", {
 *   vpcId: vpc.vpcId,
 *   cidrBlock: "10.0.1.0/24",
 *   availabilityZone: "us-east-1a",
 *   mapPublicIpOnLaunch: true,
 * });
 * ```
 *
 * Passing `vpc.vpcId` into a `Subnet` is how you build out a topology — the
 * subnet's CIDR must fall within the VPC's `cidrBlock`. Add route tables,
 * gateways, and security groups the same way.
 *
 * ### Tagging
 * **Example:** Tagging a VPC
 * ```typescript
 * const vpc = yield* AWS.EC2.Vpc("MyVpc", {
 *   cidrBlock: "10.0.0.0/16",
 *   tags: {
 *     Name: "production-vpc",
 *     Environment: "production",
 *   },
 * });
 * ```
 *
 * User tags are merged with alchemy's auto-tags (`alchemy::stack`,
 * `alchemy::stage`, `alchemy::id`), which brand the VPC as managed by your
 * stack. The `Name` tag is what surfaces in the EC2 console.
 *
 * @resource
 */
export const Vpc = Resource("AWS.EC2.VPC");
/**
 * Map a raw EC2 VPC (as returned by `describeVpcs`) plus its tags to the
 * resource's `Attributes` shape. DNS support/hostnames are not part of the
 * `Attributes` contract, so the full shape is derivable from the describe
 * response alone — no per-VPC `describeVpcAttribute` call is required.
 */
const vpcToAttributes = (vpc, region, accountId, tags) => {
    const vpcId = vpc.VpcId;
    return {
        vpcId,
        vpcArn: `arn:aws:ec2:${region}:${accountId}:vpc/${vpcId}`,
        cidrBlock: vpc.CidrBlock,
        dhcpOptionsId: vpc.DhcpOptionsId,
        state: vpc.State,
        isDefault: vpc.IsDefault ?? false,
        ownerId: vpc.OwnerId,
        cidrBlockAssociationSet: vpc.CidrBlockAssociationSet?.map((assoc) => ({
            associationId: assoc.AssociationId,
            cidrBlock: assoc.CidrBlock,
            cidrBlockState: {
                state: assoc.CidrBlockState.State,
                statusMessage: assoc.CidrBlockState.StatusMessage,
            },
        })),
        ipv6CidrBlockAssociationSet: vpc.Ipv6CidrBlockAssociationSet?.map((assoc) => ({
            associationId: assoc.AssociationId,
            ipv6CidrBlock: assoc.Ipv6CidrBlock,
            ipv6CidrBlockState: {
                state: assoc.Ipv6CidrBlockState.State,
                statusMessage: assoc.Ipv6CidrBlockState.StatusMessage,
            },
            networkBorderGroup: assoc.NetworkBorderGroup,
            ipv6Pool: assoc.Ipv6Pool,
        })),
        tags,
    };
};
/** Map the `Tags` array on a describe response to a plain record. */
const tagsFromVpc = (vpc) => Object.fromEntries((vpc.Tags ?? []).map((tag) => [tag.Key, tag.Value]));
export const VpcProvider = () => Provider.effect(Vpc, Effect.gen(function* () {
    const createTags = Effect.fn(function* (id, tags) {
        return {
            Name: id,
            ...(yield* createInternalTags(id)),
            ...tags,
        };
    });
    return {
        stables: ["vpcId", "vpcArn", "ownerId", "isDefault"],
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return;
            if (somePropsAreDifferent(olds, news, [
                "cidrBlock",
                "instanceTenancy",
                "ipv4IpamPoolId",
                "ipv6IpamPoolId",
                "ipv6CidrBlock",
            ])) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news = {}, output, session }) {
            const { accountId, region } = yield* AWSEnvironment.current;
            const desiredTags = yield* createTags(id, news.tags);
            // Observe — find the VPC if we already have its id, else describe
            // returns empty and we fall through to create. We don't trust
            // `output.vpcId` blindly: a VPC deleted out of band shows up as
            // missing and we recreate.
            let vpc;
            if (output?.vpcId) {
                const lookup = yield* ec2
                    .describeVpcs({ VpcIds: [output.vpcId] })
                    .pipe(Effect.catchTag("InvalidVpcID.NotFound", () => Effect.succeed({ Vpcs: [] })));
                vpc = lookup.Vpcs?.[0];
            }
            if (vpc === undefined) {
                const createResult = yield* ec2
                    .createVpc({
                    // TODO(sam): add all properties
                    AmazonProvidedIpv6CidrBlock: news.amazonProvidedIpv6CidrBlock,
                    InstanceTenancy: news.instanceTenancy,
                    CidrBlock: news.cidrBlock,
                    Ipv4IpamPoolId: news.ipv4IpamPoolId,
                    Ipv4NetmaskLength: news.ipv4NetmaskLength,
                    Ipv6Pool: news.ipv6Pool,
                    Ipv6CidrBlock: news.ipv6CidrBlock,
                    Ipv6IpamPoolId: news.ipv6IpamPoolId,
                    Ipv6NetmaskLength: news.ipv6NetmaskLength,
                    Ipv6CidrBlockNetworkBorderGroup: news.ipv6CidrBlockNetworkBorderGroup,
                    TagSpecifications: [
                        {
                            ResourceType: "vpc",
                            Tags: createTagsList(desiredTags),
                        },
                    ],
                    DryRun: false,
                })
                    .pipe(
                // The per-region VPC quota (default 5) is a shared pool;
                // concurrent deploys transiently exhaust it while their VPCs
                // are being torn down. Ride out the burst with a bounded
                // spaced retry (~90s) before surfacing the quota error.
                Effect.retry({
                    while: (e) => e._tag === "VpcLimitExceeded",
                    schedule: Schedule.max([
                        Schedule.spaced("10 seconds"),
                        Schedule.recurs(9),
                    ]),
                }));
                const newVpcId = createResult.Vpc.VpcId;
                yield* session.note(`VPC created: ${newVpcId}`);
                vpc = yield* waitForVpcAvailable(newVpcId, session);
            }
            const vpcId = vpc.VpcId;
            // Sync DNS attributes — observed cloud state vs desired. The default
            // values DNS support/hostnames default to differ across new vs
            // existing VPCs, so we always read first and only modify on a real
            // delta to avoid pointless API calls.
            const desiredDnsSupport = news.enableDnsSupport ?? true;
            const desiredDnsHostnames = news.enableDnsHostnames ?? false;
            const dnsSupportResult = yield* ec2.describeVpcAttribute({
                VpcId: vpcId,
                Attribute: "enableDnsSupport",
            });
            const currentDnsSupport = dnsSupportResult.EnableDnsSupport?.Value ?? true;
            if (currentDnsSupport !== desiredDnsSupport) {
                yield* ec2.modifyVpcAttribute({
                    VpcId: vpcId,
                    EnableDnsSupport: { Value: desiredDnsSupport },
                });
                yield* session.note(`Updated DNS support: ${desiredDnsSupport}`);
            }
            const dnsHostnamesResult = yield* ec2.describeVpcAttribute({
                VpcId: vpcId,
                Attribute: "enableDnsHostnames",
            });
            const currentDnsHostnames = dnsHostnamesResult.EnableDnsHostnames?.Value ?? false;
            if (currentDnsHostnames !== desiredDnsHostnames) {
                yield* ec2.modifyVpcAttribute({
                    VpcId: vpcId,
                    EnableDnsHostnames: { Value: desiredDnsHostnames },
                });
                yield* session.note(`Updated DNS hostnames: ${desiredDnsHostnames}`);
            }
            // Sync tags — observed cloud tags vs desired.
            const currentTags = Object.fromEntries((vpc.Tags ?? []).map((tag) => [tag.Key, tag.Value]));
            const { removed, upsert } = diffTags(currentTags, desiredTags);
            if (removed.length > 0) {
                yield* ec2.deleteTags({
                    Resources: [vpcId],
                    Tags: removed.map((key) => ({ Key: key })),
                    DryRun: false,
                });
            }
            if (upsert.length > 0) {
                yield* ec2.createTags({
                    Resources: [vpcId],
                    Tags: upsert,
                    DryRun: false,
                });
            }
            // Re-read final state so the returned attributes reflect what's
            // actually in the cloud after all sync steps.
            const final = yield* ec2.describeVpcs({ VpcIds: [vpcId] });
            const finalVpc = final.Vpcs?.[0];
            if (!finalVpc) {
                return yield* Effect.fail(new Error(`VPC ${vpcId} disappeared during reconcile`));
            }
            return vpcToAttributes(finalVpc, region, accountId, desiredTags);
        }),
        list: () => Effect.gen(function* () {
            const { accountId, region } = yield* AWSEnvironment.current;
            // Enumerate every VPC in this account/region, paginating
            // exhaustively. Each item is hydrated to the full `Attributes`
            // shape via the shared mapper so it's directly usable by `delete`.
            return yield* ec2.describeVpcs.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.Vpcs ?? [])
                // The default VPC is account furniture AWS provisions (and
                // test/AWS/DefaultVpc.ts recreates); never census/nuke it.
                .filter((vpc) => !vpc.IsDefault)
                .map((vpc) => vpcToAttributes(vpc, region, accountId, tagsFromVpc(vpc))))));
        }),
        delete: Effect.fn(function* ({ output, session }) {
            const vpcId = output.vpcId;
            yield* session.note(`Deleting VPC: ${vpcId}`);
            // 1. Attempt to delete VPC
            yield* ec2
                .deleteVpc({
                VpcId: vpcId,
                DryRun: false,
            })
                .pipe(Effect.tapError(Effect.logDebug), Effect.catchTag("InvalidVpcID.NotFound", () => Effect.void), 
            // Retry on dependency violations (resources still being deleted)
            Effect.retry({
                while: (e) => {
                    // DependencyViolation means there are still dependent resources
                    // This can happen if subnets/IGW are being deleted concurrently
                    return (e._tag === "DependencyViolation" ||
                        (e._tag === "ValidationError" &&
                            e.message?.includes("DependencyViolation")));
                },
                // Use fixed 5s delay instead of exponential to avoid very long waits
                schedule: Schedule.max([
                    Schedule.fixed(5000),
                    // A dependency that has not drained within ~50s is a real
                    // cleanup defect. Preserve state and fail promptly so a
                    // subsequent destroy/nuke can retry after fixing the child,
                    // rather than hanging this resource for five minutes.
                    Schedule.recurs(10),
                ]).pipe(Schedule.tap(({ attempt }) => session.note(`Waiting for dependencies to clear... (attempt ${attempt})`))),
            }), 
            // Log the actual error for debugging
            Effect.tapError((e) => session.note(`VPC delete failed: ${e._tag} - ${e.message}`)));
            // 2. Wait for VPC to be fully deleted
            yield* waitForVpcDeleted(vpcId, session);
            yield* session.note(`VPC ${vpcId} deleted successfully`);
        }),
    };
}));
// Retryable error: VPC is still pending
class VpcPending extends Data.TaggedError("VpcPending") {
}
// Retryable error: VPC still exists during deletion
class VpcStillExists extends Data.TaggedError("VpcStillExists") {
}
/**
 * Wait for VPC to be in available state
 */
const waitForVpcAvailable = (vpcId, session) => Effect.gen(function* () {
    const result = yield* ec2.describeVpcs({ VpcIds: [vpcId] });
    const vpc = result.Vpcs?.[0];
    if (!vpc) {
        return yield* Effect.fail(new Error(`VPC ${vpcId} not found`));
    }
    if (vpc.State === "available") {
        return vpc;
    }
    // Still pending - this is the only retryable case
    return yield* new VpcPending({ vpcId, state: vpc.State });
}).pipe(Effect.retry({
    while: (e) => e instanceof VpcPending,
    schedule: Schedule.max([Schedule.fixed(2000), Schedule.recurs(30)]).pipe(Schedule.tap(({ attempt }) => session
        ? session.note(`Waiting for VPC to be available... (${attempt * 2}s)`)
        : Effect.void)),
}));
/**
 * Wait for VPC to be deleted
 */
const waitForVpcDeleted = (vpcId, session) => Effect.gen(function* () {
    const result = yield* ec2
        .describeVpcs({ VpcIds: [vpcId] })
        .pipe(Effect.catchTag("InvalidVpcID.NotFound", () => Effect.succeed({ Vpcs: [] })));
    if (!result.Vpcs || result.Vpcs.length === 0) {
        return; // Successfully deleted
    }
    // Still exists - this is the only retryable case
    return yield* new VpcStillExists({ vpcId });
}).pipe(Effect.retry({
    while: (e) => e instanceof VpcStillExists,
    schedule: Schedule.max([Schedule.fixed(2000), Schedule.recurs(15)]).pipe(Schedule.tap(({ attempt }) => session.note(`Waiting for VPC deletion... (${attempt * 2}s)`))),
}));
//# sourceMappingURL=Vpc.js.map