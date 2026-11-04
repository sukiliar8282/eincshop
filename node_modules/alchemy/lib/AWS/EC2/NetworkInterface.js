import * as ec2 from "@distilled.cloud/aws/ec2";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, createTagsList, diffTags } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
export const NetworkInterfaceId = (id) => `eni-${id}`;
/**
 * An Elastic Network Interface (ENI) — a virtual network card in a VPC subnet
 * with its own private IPs, MAC address, and security groups. Attach one to an
 * instance via a {@link NetworkInterfaceAttachment} for stable-IP and
 * multi-homing patterns.
 *
 * Changing `subnetId` or the primary `privateIpAddress` replaces the interface.
 * `description`, `securityGroupIds`, and `sourceDestCheck` are applied in place.
 *
 * ### Creating a Network Interface
 * **Example:** Basic ENI
 * ```typescript
 * const eni = yield* AWS.EC2.NetworkInterface("AppEni", {
 *   subnetId: subnet.subnetId,
 *   description: "stable IP for the app server",
 *   securityGroupIds: [securityGroup.groupId],
 * });
 * ```
 *
 * The interface gets a private IP from the subnet's range. Its IP survives
 * instance replacement — detach it from a failed instance and attach it to a
 * new one to keep the same address.
 *
 * ### Fixed Private IP
 * **Example:** ENI with a Fixed Private IP
 * ```typescript
 * const eni = yield* AWS.EC2.NetworkInterface("FixedIpEni", {
 *   subnetId: subnet.subnetId,
 *   privateIpAddress: "10.0.1.50",
 *   securityGroupIds: [securityGroup.groupId],
 * });
 * ```
 *
 * Pinning `privateIpAddress` gives the interface a predictable address —
 * useful for appliances and services other resources reference by IP.
 *
 * ### Forwarding Appliances
 * **Example:** ENI with Source/Dest Check Disabled
 * ```typescript
 * const eni = yield* AWS.EC2.NetworkInterface("NatEni", {
 *   subnetId: subnet.subnetId,
 *   sourceDestCheck: false,
 *   securityGroupIds: [securityGroup.groupId],
 * });
 * ```
 *
 * Disable `sourceDestCheck` when the interface belongs to a NAT instance,
 * firewall, or router that forwards packets not addressed to itself.
 *
 * @resource
 */
export const NetworkInterface = Resource("AWS.EC2.NetworkInterface");
export const NetworkInterfaceProvider = () => Provider.effect(NetworkInterface, Effect.gen(function* () {
    return {
        stables: [
            "networkInterfaceId",
            "networkInterfaceArn",
            "subnetId",
            "vpcId",
            "availabilityZone",
            "ownerId",
        ],
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return;
            if (olds.subnetId !== news.subnetId ||
                olds.privateIpAddress !== news.privateIpAddress) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const { accountId, region } = yield* AWSEnvironment.current;
            const alchemyTags = yield* createInternalTags(id);
            const desiredTags = { ...alchemyTags, ...news.tags };
            // 1. OBSERVE — output is only an id cache.
            let eni;
            if (output?.networkInterfaceId) {
                const lookup = yield* ec2
                    .describeNetworkInterfaces({
                    NetworkInterfaceIds: [output.networkInterfaceId],
                })
                    .pipe(Effect.catchTag("InvalidNetworkInterfaceID.NotFound", () => Effect.succeed({ NetworkInterfaces: [] })));
                eni = lookup.NetworkInterfaces?.[0];
            }
            // 2. ENSURE — create the interface when missing.
            if (eni === undefined) {
                const secondary = (news.privateIpAddresses ?? []).map((ip) => ({
                    Primary: false,
                    PrivateIpAddress: ip,
                }));
                const created = yield* ec2.createNetworkInterface({
                    SubnetId: news.subnetId,
                    Description: news.description,
                    PrivateIpAddress: news.privateIpAddress,
                    PrivateIpAddresses: secondary.length > 0 ? secondary : undefined,
                    Groups: news.securityGroupIds,
                    InterfaceType: news.interfaceType,
                    TagSpecifications: [
                        {
                            ResourceType: "network-interface",
                            Tags: createTagsList(desiredTags),
                        },
                    ],
                    DryRun: false,
                });
                eni = created.NetworkInterface;
                yield* session.note(`Network interface created: ${eni.NetworkInterfaceId}`);
                eni = yield* waitForNetworkInterface(eni.NetworkInterfaceId, session);
            }
            const eniId = eni.NetworkInterfaceId;
            // 3. SYNC — description, security groups, source/dest check.
            if (news.description !== undefined &&
                news.description !== (eni.Description ?? "")) {
                yield* ec2.modifyNetworkInterfaceAttribute({
                    NetworkInterfaceId: eniId,
                    Description: { Value: news.description },
                    DryRun: false,
                });
                yield* session.note("Updated network interface description");
            }
            if (news.securityGroupIds !== undefined) {
                const observed = (eni.Groups ?? []).map((g) => g.GroupId).sort();
                const desired = [...news.securityGroupIds].sort();
                if (JSON.stringify(observed) !== JSON.stringify(desired)) {
                    yield* ec2.modifyNetworkInterfaceAttribute({
                        NetworkInterfaceId: eniId,
                        Groups: news.securityGroupIds,
                        DryRun: false,
                    });
                    yield* session.note("Updated network interface security groups");
                }
            }
            const desiredSourceDestCheck = news.sourceDestCheck ?? true;
            if ((eni.SourceDestCheck ?? true) !== desiredSourceDestCheck) {
                yield* ec2.modifyNetworkInterfaceAttribute({
                    NetworkInterfaceId: eniId,
                    SourceDestCheck: { Value: desiredSourceDestCheck },
                    DryRun: false,
                });
                yield* session.note(`Updated source/dest check: ${desiredSourceDestCheck}`);
            }
            // 3b. SYNC TAGS — diff against observed cloud tags.
            const currentTags = Object.fromEntries((eni.TagSet ?? []).map((t) => [t.Key, t.Value]));
            const { removed, upsert } = diffTags(currentTags, desiredTags);
            if (removed.length > 0) {
                yield* ec2.deleteTags({
                    Resources: [eniId],
                    Tags: removed.map((key) => ({ Key: key })),
                    DryRun: false,
                });
            }
            if (upsert.length > 0) {
                yield* ec2.createTags({
                    Resources: [eniId],
                    Tags: upsert,
                    DryRun: false,
                });
            }
            // 4. RETURN fresh attributes.
            const finalLookup = yield* ec2.describeNetworkInterfaces({
                NetworkInterfaceIds: [eniId],
            });
            const final = finalLookup.NetworkInterfaces?.[0] ?? eni;
            return toNetworkInterfaceAttributes(final, region, accountId);
        }),
        // Enumerate every network interface in the ambient account/region.
        list: () => Effect.gen(function* () {
            const { accountId, region } = yield* AWSEnvironment.current;
            const chunk = yield* ec2.describeNetworkInterfaces
                .pages({})
                .pipe(Stream.runCollect);
            return Array.from(chunk).flatMap((page) => (page.NetworkInterfaces ?? []).map((n) => toNetworkInterfaceAttributes(n, region, accountId)));
        }),
        delete: Effect.fn(function* ({ output, session }) {
            const eniId = output.networkInterfaceId;
            yield* session.note(`Deleting network interface: ${eniId}`);
            yield* ec2
                .deleteNetworkInterface({
                NetworkInterfaceId: eniId,
                DryRun: false,
            })
                .pipe(Effect.tapError(Effect.logDebug), Effect.catchTag("InvalidNetworkInterfaceID.NotFound", () => Effect.void), 
            // A just-detached interface can briefly report InUse — retry
            // until the attachment fully clears.
            Effect.retry({
                while: (e) => e._tag === "InvalidNetworkInterface.InUse",
                schedule: Schedule.max([
                    Schedule.fixed(3000),
                    Schedule.recurs(20),
                ]).pipe(Schedule.tap(({ attempt }) => session.note(`Waiting for interface to detach... (attempt ${attempt + 1})`))),
            }));
            yield* session.note(`Network interface ${eniId} deleted`);
        }),
    };
}));
const toNetworkInterfaceAttributes = (eni, region, accountId) => {
    const eniId = eni.NetworkInterfaceId;
    return {
        networkInterfaceId: eniId,
        networkInterfaceArn: `arn:aws:ec2:${region}:${accountId}:network-interface/${eniId}`,
        subnetId: eni.SubnetId,
        vpcId: eni.VpcId,
        availabilityZone: eni.AvailabilityZone,
        privateIpAddress: eni.PrivateIpAddress,
        privateIpAddresses: (eni.PrivateIpAddresses ?? [])
            .map((p) => p.PrivateIpAddress)
            .filter((ip) => ip !== undefined),
        macAddress: eni.MacAddress,
        securityGroupIds: (eni.Groups ?? [])
            .map((g) => g.GroupId)
            .filter((g) => g !== undefined),
        sourceDestCheck: eni.SourceDestCheck ?? true,
        status: eni.Status ?? "available",
        ownerId: eni.OwnerId,
    };
};
class NetworkInterfacePending extends Data.TaggedError("NetworkInterfacePending") {
}
/**
 * Wait for the network interface to reach an `available` (or in-use) status.
 */
const waitForNetworkInterface = (networkInterfaceId, session) => Effect.gen(function* () {
    const result = yield* ec2.describeNetworkInterfaces({
        NetworkInterfaceIds: [networkInterfaceId],
    });
    const eni = result.NetworkInterfaces?.[0];
    if (!eni) {
        return yield* Effect.fail(new Error(`Network interface ${networkInterfaceId} not found`));
    }
    if (eni.Status === "available" || eni.Status === "in-use") {
        return eni;
    }
    return yield* new NetworkInterfacePending({
        networkInterfaceId,
        status: eni.Status,
    });
}).pipe(Effect.retry({
    while: (e) => e instanceof NetworkInterfacePending,
    schedule: Schedule.max([
        Schedule.fixed(2000),
        Schedule.recurs(20), // max ~40s
    ]).pipe(Schedule.tap(({ attempt }) => session
        ? session.note(`Waiting for network interface... (${(attempt + 1) * 2}s)`)
        : Effect.void)),
}));
//# sourceMappingURL=NetworkInterface.js.map