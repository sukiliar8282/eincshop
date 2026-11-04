import * as ec2 from "@distilled.cloud/aws/ec2";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, createTagsList, diffTags } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
export const AllocationId = (id) => `eipalloc-${id}`;
/**
 * An Elastic IP address — a static, public IPv4 address allocated to your AWS
 * account that you can attach to instances, network interfaces, or NAT
 * gateways.
 *
 * Allocating an `EIP` reserves the address; you then reference its
 * `allocationId` from the resource that should use it (for example a public
 * `NatGateway`). The address is released back to AWS when the resource is
 * destroyed. The pool-related properties (`publicIpv4Pool`,
 * `networkBorderGroup`, `customerOwnedIpv4Pool`) are immutable and replace the
 * address when changed.
 *
 * ### Allocating Elastic IPs
 * By default an Elastic IP is allocated for use within a VPC (`domain: "vpc"`),
 * which is the only domain available to modern accounts.
 * **Example:** VPC-Scoped Elastic IP
 * ```typescript
 * const eip = yield* AWS.EC2.EIP("MyEip", {
 *   domain: "vpc",
 *   tags: { Name: "app-eip" },
 * });
 * ```
 * This reserves a standard, Amazon-owned public IPv4 address scoped to your VPC;
 * `domain` defaults to `"vpc"`, so it can be omitted, and `tags` help you find
 * the address in the console and on the bill.
 *
 * ### Bring-Your-Own-IP and Address Pools
 * If you have onboarded an address range to AWS (BYOIP) or use Outposts, you can
 * draw the address from a specific pool instead of Amazon's general pool.
 * **Example:** Allocate from a Public IPv4 (BYOIP) Pool
 * ```typescript
 * const eip = yield* AWS.EC2.EIP("ByoipEip", {
 *   publicIpv4Pool: "ipv4pool-ec2-0abcdef1234567890",
 *   networkBorderGroup: "us-east-1",
 * });
 * ```
 * `publicIpv4Pool` selects an address from a pool you own rather than a random
 * Amazon address, and `networkBorderGroup` restricts which zone group AWS
 * advertises it from (useful for Local and Wavelength Zones).
 *
 * **Example:** Allocate from a Customer-Owned Pool (Outposts)
 * ```typescript
 * const eip = yield* AWS.EC2.EIP("CoIpEip", {
 *   customerOwnedIpv4Pool: "ipv4pool-coip-0abcdef1234567890",
 * });
 * ```
 * `customerOwnedIpv4Pool` pulls a customer-owned IP (CoIP) from an
 * Outposts-associated pool, for workloads that must use your own on-premises
 * address space.
 *
 * ### Using an Elastic IP
 * **Example:** Attach to a NAT Gateway
 * ```typescript
 * const eip = yield* AWS.EC2.EIP("NatEip", {});
 *
 * const natGateway = yield* AWS.EC2.NatGateway("NatGateway", {
 *   subnetId: publicSubnet.subnetId,
 *   allocationId: eip.allocationId,
 * });
 * ```
 * Downstream resources consume the reserved address through its `allocationId`;
 * here the EIP becomes the fixed public IP of a NAT gateway.
 *
 * @resource
 */
export const EIP = Resource("AWS.EC2.EIP");
export const EIPProvider = () => Provider.effect(EIP, Effect.gen(function* () {
    const createTags = Effect.fn(function* (id, tags) {
        return {
            Name: id,
            ...(yield* createInternalTags(id)),
            ...tags,
        };
    });
    return {
        stables: ["allocationId", "eipArn", "publicIp"],
        list: () => Effect.gen(function* () {
            const { region, accountId } = yield* AWSEnvironment.current;
            // describeAddresses is non-paginated and returns every Elastic IP
            // in the account/region in a single response.
            const result = yield* ec2.describeAddresses({});
            return (result.Addresses ?? [])
                .filter((a) => a.AllocationId != null)
                .map((address) => ({
                allocationId: address.AllocationId,
                eipArn: `arn:aws:ec2:${region}:${accountId}:elastic-ip/${address.AllocationId}`,
                publicIp: address.PublicIp,
                publicIpv4Pool: address.PublicIpv4Pool,
                domain: address.Domain ?? "vpc",
                networkBorderGroup: address.NetworkBorderGroup,
                customerOwnedIp: address.CustomerOwnedIp,
                customerOwnedIpv4Pool: address.CustomerOwnedIpv4Pool,
                carrierIp: address.CarrierIp,
            }));
        }),
        read: Effect.fn(function* ({ output }) {
            const { region, accountId } = yield* AWSEnvironment.current;
            if (!output)
                return undefined;
            const result = yield* ec2.describeAddresses({
                AllocationIds: [output.allocationId],
            });
            const address = result.Addresses?.[0];
            if (!address) {
                return yield* Effect.fail(new Error(`EIP ${output.allocationId} not found`));
            }
            return {
                allocationId: address.AllocationId,
                eipArn: `arn:aws:ec2:${region}:${accountId}:elastic-ip/${address.AllocationId}`,
                publicIp: address.PublicIp,
                publicIpv4Pool: address.PublicIpv4Pool,
                domain: address.Domain ?? "vpc",
                networkBorderGroup: address.NetworkBorderGroup,
                customerOwnedIp: address.CustomerOwnedIp,
                customerOwnedIpv4Pool: address.CustomerOwnedIpv4Pool,
                carrierIp: address.CarrierIp,
            };
        }),
        diff: Effect.fn(function* ({ news = {}, olds = {} }) {
            if (!isResolved(news))
                return;
            // EIPs are immutable - any change to core properties requires replacement
            if (news.publicIpv4Pool !== olds.publicIpv4Pool ||
                news.networkBorderGroup !== olds.networkBorderGroup ||
                news.customerOwnedIpv4Pool !== olds.customerOwnedIpv4Pool) {
                return { action: "replace" };
            }
            // Tags can be updated in-place
        }),
        reconcile: Effect.fn(function* ({ id, news = {}, output, session }) {
            const { region, accountId } = yield* AWSEnvironment.current;
            const desiredTags = yield* createTags(id, news.tags);
            // Observe — try to find an existing EIP via the cached allocationId.
            // If it was released out-of-band, fall through to allocate.
            let address;
            if (output?.allocationId) {
                const lookup = yield* ec2
                    .describeAddresses({ AllocationIds: [output.allocationId] })
                    .pipe(Effect.catchTag("InvalidAllocationID.NotFound", () => Effect.succeed({ Addresses: [] })));
                address = lookup.Addresses?.[0];
            }
            // Ensure — allocate a new EIP when none was observed.
            if (address === undefined) {
                yield* session.note("Allocating Elastic IP address...");
                const result = yield* ec2.allocateAddress({
                    Domain: news.domain ?? "vpc",
                    PublicIpv4Pool: news.publicIpv4Pool,
                    NetworkBorderGroup: news.networkBorderGroup,
                    CustomerOwnedIpv4Pool: news.customerOwnedIpv4Pool,
                    TagSpecifications: [
                        {
                            ResourceType: "elastic-ip",
                            Tags: createTagsList(desiredTags),
                        },
                    ],
                    DryRun: false,
                });
                const allocationId = result.AllocationId;
                yield* session.note(`Elastic IP allocated: ${allocationId}`);
                const lookup = yield* ec2.describeAddresses({
                    AllocationIds: [allocationId],
                });
                address = lookup.Addresses?.[0];
                if (!address) {
                    return yield* Effect.fail(new Error(`EIP ${allocationId} disappeared after allocation`));
                }
            }
            const allocationId = address.AllocationId;
            // Sync tags — observed cloud tags vs desired.
            const currentTags = Object.fromEntries((address.Tags ?? []).map((t) => [t.Key, t.Value]));
            const { removed, upsert } = diffTags(currentTags, desiredTags);
            if (removed.length > 0) {
                yield* ec2.deleteTags({
                    Resources: [allocationId],
                    Tags: removed.map((key) => ({ Key: key })),
                    DryRun: false,
                });
            }
            if (upsert.length > 0) {
                yield* ec2.createTags({
                    Resources: [allocationId],
                    Tags: upsert,
                    DryRun: false,
                });
            }
            return {
                allocationId,
                eipArn: `arn:aws:ec2:${region}:${accountId}:elastic-ip/${allocationId}`,
                publicIp: address.PublicIp,
                publicIpv4Pool: address.PublicIpv4Pool,
                domain: address.Domain ?? "vpc",
                networkBorderGroup: address.NetworkBorderGroup,
                customerOwnedIp: address.CustomerOwnedIp,
                customerOwnedIpv4Pool: address.CustomerOwnedIpv4Pool,
                carrierIp: address.CarrierIp,
            };
        }),
        delete: Effect.fn(function* ({ output, session }) {
            const allocationId = output.allocationId;
            yield* session.note(`Releasing Elastic IP: ${allocationId}`);
            yield* ec2
                .releaseAddress({
                AllocationId: allocationId,
                DryRun: false,
            })
                .pipe(Effect.catchTag("InvalidAllocationID.NotFound", () => Effect.void), Effect.catchTag("AuthFailure", () => Effect.void), Effect.tapError(Effect.logDebug), 
            // Retry when EIP is still in use (e.g., NAT Gateway being deleted)
            Effect.retry({
                while: (e) => {
                    return (
                    // TODO(sam): not sure if the API will actually throw this
                    // e._tag === "DependencyViolation" ||
                    // this throws if the address hasn't been disassociated from all resources
                    // we will retry it assuming that another resource provider is dissassociating it (e.g. a NAT Gateway resource is being deleted)
                    e._tag === "InvalidIPAddress.InUse");
                },
                schedule: Schedule.max([
                    Schedule.exponential(1000, 1.5),
                    Schedule.recurs(20),
                ]).pipe(Schedule.tap(({ attempt }) => session.note(`EIP still in use, waiting for release... (attempt ${attempt})`))),
            }));
            yield* session.note(`Elastic IP ${allocationId} released`);
        }),
    };
}));
//# sourceMappingURL=EIP.js.map