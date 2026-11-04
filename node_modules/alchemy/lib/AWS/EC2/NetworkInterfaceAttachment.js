import * as ec2 from "@distilled.cloud/aws/ec2";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * Attaches an {@link NetworkInterface} (ENI) to an EC2 {@link Instance} at a
 * device index. The interface and instance must be in the same Availability
 * Zone. On delete the interface is detached (force-detached as a fallback)
 * before the resource is removed.
 *
 * This is an existence-style resource — its identity is the
 * `networkInterfaceId`/`instanceId`/`deviceIndex` triple. Changing any of them
 * replaces the attachment.
 *
 * ### Attaching a Network Interface
 * **Example:** Attach a Secondary ENI to an Instance
 * ```typescript
 * const attachment = yield* AWS.EC2.NetworkInterfaceAttachment("SecondaryEni", {
 *   networkInterfaceId: eni.networkInterfaceId,
 *   instanceId: instance.instanceId,
 *   deviceIndex: 1,
 * });
 * ```
 *
 * Device index 0 is the instance's primary interface, so secondary interfaces
 * use index 1 and up. The ENI's IPs and security groups now apply to the
 * instance on that interface.
 *
 * @resource
 */
export const NetworkInterfaceAttachment = Resource("AWS.EC2.NetworkInterfaceAttachment");
export const NetworkInterfaceAttachmentProvider = () => Provider.effect(NetworkInterfaceAttachment, Effect.gen(function* () {
    return {
        stables: [
            "attachmentId",
            "networkInterfaceId",
            "instanceId",
            "deviceIndex",
        ],
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return;
            if (olds.networkInterfaceId !== news.networkInterfaceId ||
                olds.instanceId !== news.instanceId ||
                olds.deviceIndex !== news.deviceIndex) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ news, output, session }) {
            // 1. OBSERVE — the attachment lives on the interface.
            const lookup = yield* ec2
                .describeNetworkInterfaces({
                NetworkInterfaceIds: [news.networkInterfaceId],
            })
                .pipe(Effect.catchTag("InvalidNetworkInterfaceID.NotFound", () => Effect.succeed({ NetworkInterfaces: [] })));
            const eni = lookup.NetworkInterfaces?.[0];
            const existing = eni?.Attachment;
            const attachedToInstance = existing?.InstanceId === news.instanceId &&
                existing?.Status !== "detaching" &&
                existing?.Status !== "detached";
            // 2. ENSURE — attach when not already attached to this instance.
            let attachmentId = attachedToInstance && existing?.AttachmentId
                ? existing.AttachmentId
                : output?.attachmentId;
            if (!attachedToInstance) {
                const result = yield* ec2.attachNetworkInterface({
                    NetworkInterfaceId: news.networkInterfaceId,
                    InstanceId: news.instanceId,
                    DeviceIndex: news.deviceIndex,
                    DryRun: false,
                });
                attachmentId = result.AttachmentId;
                yield* session.note(`Network interface ${news.networkInterfaceId} attaching to ${news.instanceId}`);
            }
            // 3. WAIT — until attached.
            const status = yield* waitForEniAttachmentState(news.networkInterfaceId, "attached", session);
            return {
                attachmentId: attachmentId,
                networkInterfaceId: news.networkInterfaceId,
                instanceId: news.instanceId,
                deviceIndex: news.deviceIndex,
                status,
            };
        }),
        // Attachments are embedded in interfaces; there is no standalone
        // enumeration keyed to this resource's identity.
        list: () => Effect.succeed([]),
        delete: Effect.fn(function* ({ output, olds, session }) {
            const { attachmentId, networkInterfaceId } = output;
            const force = olds?.forceDetach ?? true;
            yield* session.note(`Detaching network interface ${networkInterfaceId} (${attachmentId})`);
            yield* ec2
                .detachNetworkInterface({
                AttachmentId: attachmentId,
                Force: force,
                DryRun: false,
            })
                .pipe(Effect.catchTag("InvalidAttachmentID.NotFound", () => Effect.void), 
            // The interface can still be in-use momentarily — retry.
            Effect.retry({
                while: (e) => e._tag === "DependencyViolation",
                schedule: Schedule.max([
                    Schedule.fixed(3000),
                    Schedule.recurs(15),
                ]),
            }));
            // Wait for the interface to return to 'available'.
            yield* waitForEniDetached(networkInterfaceId, session);
            yield* session.note(`Network interface ${networkInterfaceId} detached`);
        }),
    };
}));
class EniAttachmentPending extends Data.TaggedError("EniAttachmentPending") {
}
class EniStillAttached extends Data.TaggedError("EniStillAttached") {
}
/**
 * Wait for the interface's attachment to reach a target status.
 */
const waitForEniAttachmentState = (networkInterfaceId, target, session) => Effect.gen(function* () {
    const result = yield* ec2.describeNetworkInterfaces({
        NetworkInterfaceIds: [networkInterfaceId],
    });
    const status = result.NetworkInterfaces?.[0]?.Attachment?.Status;
    if (status === target) {
        return status;
    }
    return yield* new EniAttachmentPending({
        networkInterfaceId,
        status: status ?? "unknown",
    });
}).pipe(Effect.retry({
    while: (e) => e instanceof EniAttachmentPending,
    schedule: Schedule.max([
        Schedule.fixed(2000),
        Schedule.recurs(20), // max ~40s
    ]).pipe(Schedule.tap(({ attempt }) => session
        ? session.note(`Waiting for interface attachment... (${(attempt + 1) * 2}s)`)
        : Effect.void)),
}));
/**
 * Wait for the interface to return to `available` after a detach.
 */
const waitForEniDetached = (networkInterfaceId, session) => Effect.gen(function* () {
    const result = yield* ec2
        .describeNetworkInterfaces({
        NetworkInterfaceIds: [networkInterfaceId],
    })
        .pipe(Effect.catchTag("InvalidNetworkInterfaceID.NotFound", () => Effect.succeed({ NetworkInterfaces: [] })));
    const eni = result.NetworkInterfaces?.[0];
    if (!eni || eni.Status === "available" || eni.Attachment === undefined) {
        return;
    }
    return yield* new EniStillAttached({
        networkInterfaceId,
        status: eni.Status ?? "unknown",
    });
}).pipe(Effect.retry({
    while: (e) => e instanceof EniStillAttached,
    schedule: Schedule.max([
        Schedule.fixed(2000),
        Schedule.recurs(20), // max ~40s
    ]).pipe(Schedule.tap(({ attempt }) => session
        ? session.note(`Waiting for interface to detach... (${(attempt + 1) * 2}s)`)
        : Effect.void)),
}));
//# sourceMappingURL=NetworkInterfaceAttachment.js.map