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
import { getDefaultVpcScope } from "./defaultVpcScope.js";
/**
 * A DHCP options set configures the DHCP parameters (domain name, DNS servers,
 * NTP servers, NetBIOS settings) that a VPC hands out to the instances launched
 * inside it. Attach a custom set to a VPC to override the AWS defaults — for
 * example to point instances at your own DNS or an internal search domain.
 *
 * A DHCP options set is immutable: AWS provides no edit API, so changing any
 * DHCP parameter replaces the set. Setting `vpcId` associates the set with a
 * VPC; clearing it (or deleting the resource) re-associates the VPC with the
 * account's default options set, since a set must be disassociated from every
 * VPC before it can be deleted.
 *
 * ### Creating a DHCP Options Set
 * **Example:** Custom DNS and Search Domain
 * ```typescript
 * const dhcp = yield* AWS.EC2.DhcpOptions("CorpDhcp", {
 *   domainName: "corp.internal",
 *   domainNameServers: ["10.0.0.2", "AmazonProvidedDNS"],
 *   vpcId: myVpc.vpcId,
 * });
 * ```
 * Creates the options set and associates it with the VPC in one step.
 * Instances launched into the VPC receive the `corp.internal` search domain and
 * the listed DNS servers.
 *
 * **Example:** NTP and NetBIOS Configuration
 * ```typescript
 * const dhcp = yield* AWS.EC2.DhcpOptions("Dhcp", {
 *   ntpServers: ["169.254.169.123"],
 *   netbiosNameServers: ["10.0.0.5"],
 *   netbiosNodeType: "2",
 * });
 * ```
 * Creates an unassociated options set that you can associate later by setting
 * `vpcId`.
 *
 * @resource
 */
export const DhcpOptions = Resource("AWS.EC2.DhcpOptions");
class DhcpOptionsStillVisible extends Data.TaggedError("DhcpOptionsStillVisible") {
}
// Build the NewDhcpConfiguration list AWS expects from the flat props.
const buildConfigurations = (props) => {
    const configs = [];
    if (props.domainName !== undefined) {
        configs.push({ Key: "domain-name", Values: [props.domainName] });
    }
    if (props.domainNameServers !== undefined) {
        configs.push({
            Key: "domain-name-servers",
            Values: props.domainNameServers,
        });
    }
    if (props.ntpServers !== undefined) {
        configs.push({ Key: "ntp-servers", Values: props.ntpServers });
    }
    if (props.netbiosNameServers !== undefined) {
        configs.push({
            Key: "netbios-name-servers",
            Values: props.netbiosNameServers,
        });
    }
    if (props.netbiosNodeType !== undefined) {
        configs.push({
            Key: "netbios-node-type",
            Values: [props.netbiosNodeType],
        });
    }
    return configs;
};
export const DhcpOptionsProvider = () => Provider.effect(DhcpOptions, Effect.gen(function* () {
    const createTags = Effect.fn(function* (id, tags) {
        return {
            Name: id,
            ...(yield* createInternalTags(id)),
            ...tags,
        };
    });
    const describeDhcpOptions = (dhcpOptionsId) => ec2.describeDhcpOptions({ DhcpOptionsIds: [dhcpOptionsId] }).pipe(Effect.map((r) => r.DhcpOptions?.[0]), Effect.catchTag("InvalidDhcpOptionID.NotFound", () => Effect.succeed(undefined)), Effect.catchTag("InvalidDhcpOptionsID.NotFound", () => Effect.succeed(undefined)));
    const waitUntilDhcpOptionsGone = (dhcpOptionsId) => describeDhcpOptions(dhcpOptionsId).pipe(Effect.flatMap((options) => options === undefined
        ? Effect.void
        : Effect.fail(new DhcpOptionsStillVisible({ dhcpOptionsId }))), Effect.retry({
        while: (error) => error._tag === "DhcpOptionsStillVisible",
        schedule: Schedule.max([Schedule.fixed(1000), Schedule.recurs(15)]),
    }));
    // Which VPC (if any) currently points at this options set.
    const findAssociatedVpc = (dhcpOptionsId) => ec2
        .describeVpcs({
        Filters: [{ Name: "dhcp-options-id", Values: [dhcpOptionsId] }],
    })
        .pipe(Effect.map((r) => r.Vpcs?.[0]?.VpcId));
    const toAttrs = (opts, vpcId) => AWSEnvironment.current.pipe(Effect.map((env) => ({
        dhcpOptionsId: opts.DhcpOptionsId,
        dhcpOptionsArn: `arn:aws:ec2:${env.region}:${env.accountId}:dhcp-options/${opts.DhcpOptionsId}`,
        ownerId: opts.OwnerId,
        vpcId,
    })));
    return {
        stables: ["dhcpOptionsId", "dhcpOptionsArn", "ownerId"],
        list: () => Effect.gen(function* () {
            const env = yield* AWSEnvironment.current;
            // The options set the default VPC references is the account
            // default AWS provisions; never census/nuke it.
            const defaultVpc = yield* getDefaultVpcScope;
            const items = yield* ec2.describeDhcpOptions.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.DhcpOptions ?? [])
                .filter((o) => o.DhcpOptionsId != null)
                .filter((o) => defaultVpc.dhcpOptionsId === undefined ||
                o.DhcpOptionsId !== defaultVpc.dhcpOptionsId)
                .map((o) => ({
                dhcpOptionsId: o.DhcpOptionsId,
                dhcpOptionsArn: `arn:aws:ec2:${env.region}:${env.accountId}:dhcp-options/${o.DhcpOptionsId}`,
                ownerId: o.OwnerId,
                vpcId: undefined,
            })))));
            return items;
        }),
        read: Effect.fn(function* ({ output }) {
            if (!output)
                return undefined;
            const opts = yield* describeDhcpOptions(output.dhcpOptionsId);
            if (!opts)
                return undefined;
            const vpcId = yield* findAssociatedVpc(output.dhcpOptionsId);
            return yield* toAttrs(opts, vpcId);
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return;
            // The DHCP configuration itself is immutable — a change replaces.
            const eq = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
            if (news.domainName !== olds.domainName ||
                !eq(news.domainNameServers, olds.domainNameServers) ||
                !eq(news.ntpServers, olds.ntpServers) ||
                !eq(news.netbiosNameServers, olds.netbiosNameServers) ||
                news.netbiosNodeType !== olds.netbiosNodeType) {
                return { action: "replace" };
            }
            // vpcId association and tags are mutable in place.
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const desiredTags = yield* createTags(id, news.tags);
            // Observe — find the options set via the cached id, else create.
            let opts;
            if (output?.dhcpOptionsId) {
                opts = yield* describeDhcpOptions(output.dhcpOptionsId);
            }
            // Ensure — create if missing.
            if (opts === undefined) {
                yield* session.note("Creating DHCP options set...");
                const result = yield* ec2.createDhcpOptions({
                    DhcpConfigurations: buildConfigurations(news),
                    TagSpecifications: [
                        {
                            ResourceType: "dhcp-options",
                            Tags: createTagsList(desiredTags),
                        },
                    ],
                });
                opts = result.DhcpOptions;
                yield* session.note(`DHCP options set created: ${opts.DhcpOptionsId}`);
            }
            const dhcpOptionsId = opts.DhcpOptionsId;
            // Sync association — associate the desired VPC, and detach any VPC we
            // previously associated that is no longer desired (re-point it at the
            // default options set).
            const previousVpc = output?.vpcId;
            if (news.vpcId) {
                yield* ec2.associateDhcpOptions({
                    DhcpOptionsId: dhcpOptionsId,
                    VpcId: news.vpcId,
                });
            }
            if (previousVpc && previousVpc !== news.vpcId) {
                yield* ec2.associateDhcpOptions({
                    DhcpOptionsId: "default",
                    VpcId: previousVpc,
                });
            }
            // Sync tags — observed cloud tags vs desired.
            const currentTags = (yield* ec2
                .describeTags({
                Filters: [
                    { Name: "resource-id", Values: [dhcpOptionsId] },
                    { Name: "resource-type", Values: ["dhcp-options"] },
                ],
            })
                .pipe(Effect.map((r) => Object.fromEntries(r.Tags?.map((t) => [t.Key, t.Value]) ?? [])))) ?? {};
            const { removed, upsert } = diffTags(currentTags, desiredTags);
            if (removed.length > 0) {
                yield* ec2.deleteTags({
                    Resources: [dhcpOptionsId],
                    Tags: removed.map((key) => ({ Key: key })),
                });
            }
            if (upsert.length > 0) {
                yield* ec2.createTags({
                    Resources: [dhcpOptionsId],
                    Tags: upsert,
                });
            }
            return yield* toAttrs(opts, news.vpcId);
        }),
        delete: Effect.fn(function* ({ output, session }) {
            const dhcpOptionsId = output.dhcpOptionsId;
            // Disassociate any VPC first — a set cannot be deleted while attached.
            if (output.vpcId) {
                yield* session.note(`Restoring default DHCP options on ${output.vpcId}...`);
                yield* ec2
                    .associateDhcpOptions({
                    DhcpOptionsId: "default",
                    VpcId: output.vpcId,
                })
                    .pipe(Effect.catchTag("InvalidVpcID.NotFound", () => Effect.void));
            }
            yield* session.note(`Deleting DHCP options set: ${dhcpOptionsId}`);
            yield* ec2.deleteDhcpOptions({ DhcpOptionsId: dhcpOptionsId }).pipe(Effect.catchTag("InvalidDhcpOptionID.NotFound", () => Effect.void), Effect.catchTag("InvalidDhcpOptionsID.NotFound", () => Effect.void), 
            // A VPC association may still be clearing.
            Effect.retry({
                while: (e) => e._tag === "DependencyViolation",
                schedule: Schedule.max([
                    Schedule.fixed(3000),
                    Schedule.recurs(20),
                ]),
            }));
            yield* waitUntilDhcpOptionsGone(dhcpOptionsId);
        }),
    };
}));
//# sourceMappingURL=DhcpOptions.js.map