import * as ec2 from "@distilled.cloud/aws/ec2";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
// Explicitly-typed pipeable retry helpers. Inlining `Effect.retry` in a
// provider lifecycle op leaks `Retry.Return`'s conditional into declaration
// emit and widens the provider layer to `unknown` R for every consumer of
// `AWS.providers()`.
const retryWhileVolumeInUse = (self) => Effect.retry(self, {
    while: (e) => e._tag === "VolumeInUse",
    schedule: Schedule.max([Schedule.fixed(2000), Schedule.recurs(15)]),
});
const retryWhileIncorrectState = (self) => Effect.retry(self, {
    while: (e) => e._tag === "IncorrectState",
    schedule: Schedule.max([Schedule.fixed(2000), Schedule.recurs(10)]),
});
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * Attaches an EBS {@link Volume} to an EC2 {@link Instance} at a device name.
 * The volume and instance must be in the same Availability Zone. On delete the
 * volume is detached (and force-detached as a fallback) before the resource is
 * removed.
 *
 * This is an existence-style resource — its identity is the
 * `volumeId`/`instanceId`/`device` triple. Changing any of them replaces the
 * attachment.
 *
 * ### Attaching a Volume
 * **Example:** Attach a Volume to an Instance
 * ```typescript
 * const attachment = yield* AWS.EC2.VolumeAttachment("DataAttachment", {
 *   volumeId: volume.volumeId,
 *   instanceId: instance.instanceId,
 *   device: "/dev/sdf",
 * });
 * ```
 *
 * The volume appears to the instance as a block device at `device`. On modern
 * Linux AMIs the kernel may rename `/dev/sdf` to `/dev/xvdf` — check
 * `lsblk` inside the instance. The volume and instance must share an AZ.
 *
 * @resource
 */
export const VolumeAttachment = Resource("AWS.EC2.VolumeAttachment");
export const VolumeAttachmentProvider = () => Provider.effect(VolumeAttachment, Effect.gen(function* () {
    return {
        stables: ["volumeId", "instanceId", "device"],
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return;
            if (olds.volumeId !== news.volumeId ||
                olds.instanceId !== news.instanceId ||
                olds.device !== news.device) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ news, session }) {
            // 1. OBSERVE — attachments are embedded in the volume; find one for
            //    this instance.
            const lookup = yield* ec2
                .describeVolumes({ VolumeIds: [news.volumeId] })
                .pipe(Effect.catchTag("InvalidVolume.NotFound", () => Effect.succeed({ Volumes: [] })));
            const volume = lookup.Volumes?.[0];
            let attachment = volume?.Attachments?.find((a) => a.InstanceId === news.instanceId &&
                a.State !== "detaching" &&
                a.State !== "detached");
            // 2. ENSURE — attach the volume when it is not already attached to
            //    this instance.
            if (attachment === undefined) {
                const result = yield* ec2
                    .attachVolume({
                    VolumeId: news.volumeId,
                    InstanceId: news.instanceId,
                    Device: news.device,
                    DryRun: false,
                })
                    .pipe(
                // The volume can briefly report VolumeInUse while a prior
                // detach settles — retry until it frees up.
                retryWhileVolumeInUse);
                yield* session.note(`Volume ${news.volumeId} attaching to ${news.instanceId} at ${news.device}`);
                attachment = {
                    VolumeId: result.VolumeId,
                    InstanceId: result.InstanceId,
                    Device: result.Device,
                    State: result.State,
                };
            }
            // 3. WAIT — until the attachment is fully attached.
            const state = yield* waitForAttachmentState(news.volumeId, news.instanceId, "attached", session);
            return {
                volumeId: news.volumeId,
                instanceId: news.instanceId,
                device: attachment.Device ?? news.device,
                state,
            };
        }),
        // Attachments are embedded in volumes; there is no standalone
        // enumeration keyed to this resource's identity.
        list: () => Effect.succeed([]),
        delete: Effect.fn(function* ({ output, olds, session }) {
            const { volumeId, instanceId, device } = output;
            const force = olds?.forceDetach ?? true;
            yield* session.note(`Detaching volume ${volumeId} from ${instanceId}`);
            // If the volume is already gone, nothing to detach.
            const lookup = yield* ec2
                .describeVolumes({ VolumeIds: [volumeId] })
                .pipe(Effect.catchTag("InvalidVolume.NotFound", () => Effect.succeed({ Volumes: [] })));
            const volume = lookup.Volumes?.[0];
            if (!volume) {
                return;
            }
            const attached = volume.Attachments?.some((a) => a.InstanceId === instanceId && a.State !== "detached");
            if (!attached) {
                return;
            }
            // Normal detach, retrying while the volume is still in a transient
            // state (attaching / busy → IncorrectState).
            yield* ec2
                .detachVolume({
                VolumeId: volumeId,
                InstanceId: instanceId,
                Device: device,
                DryRun: false,
            })
                .pipe(Effect.catchTag("InvalidVolume.NotFound", () => Effect.void), retryWhileIncorrectState, 
            // Fall back to a forced detach if it still won't release.
            // Explicit return type: the ternary's branches are two
            // structurally different Effects and TS cannot unify them on
            // its own.
            Effect.catchTag("IncorrectState", (e) => force
                ? ec2
                    .detachVolume({
                    VolumeId: volumeId,
                    InstanceId: instanceId,
                    Device: device,
                    Force: true,
                    DryRun: false,
                })
                    .pipe(Effect.catchTag("InvalidVolume.NotFound", () => Effect.void), Effect.catchTag("IncorrectState", () => Effect.void))
                : Effect.fail(e)));
            // Wait for the volume to return to 'available'.
            yield* waitForVolumeDetached(volumeId, session);
            yield* session.note(`Volume ${volumeId} detached from ${instanceId}`);
        }),
    };
}));
class AttachmentNotReady extends Data.TaggedError("AttachmentNotReady") {
}
class VolumeStillAttached extends Data.TaggedError("VolumeStillAttached") {
}
/**
 * Wait for the attachment of `volumeId` to `instanceId` to reach a target
 * state.
 */
const waitForAttachmentState = (volumeId, instanceId, target, session) => Effect.gen(function* () {
    const result = yield* ec2.describeVolumes({ VolumeIds: [volumeId] });
    const attachment = result.Volumes?.[0]?.Attachments?.find((a) => a.InstanceId === instanceId);
    const state = attachment?.State;
    if (state === target) {
        return state;
    }
    return yield* new AttachmentNotReady({
        volumeId,
        state: state ?? "unknown",
    });
}).pipe(Effect.retry({
    while: (e) => e instanceof AttachmentNotReady,
    schedule: Schedule.max([
        Schedule.fixed(2000),
        Schedule.recurs(20), // max ~40s
    ]).pipe(Schedule.tap(({ attempt }) => session
        ? session.note(`Waiting for volume attachment... (${(attempt + 1) * 2}s)`)
        : Effect.void)),
}));
/**
 * Wait for the volume to return to `available` after a detach.
 */
const waitForVolumeDetached = (volumeId, session) => Effect.gen(function* () {
    const result = yield* ec2
        .describeVolumes({ VolumeIds: [volumeId] })
        .pipe(Effect.catchTag("InvalidVolume.NotFound", () => Effect.succeed({ Volumes: [] })));
    const volume = result.Volumes?.[0];
    if (!volume || volume.State === "available") {
        return;
    }
    return yield* new VolumeStillAttached({
        volumeId,
        state: volume.State ?? "unknown",
    });
}).pipe(Effect.retry({
    while: (e) => e instanceof VolumeStillAttached,
    schedule: Schedule.max([
        Schedule.fixed(2000),
        Schedule.recurs(20), // max ~40s
    ]).pipe(Schedule.tap(({ attempt }) => session
        ? session.note(`Waiting for volume to detach... (${(attempt + 1) * 2}s)`)
        : Effect.void)),
}));
//# sourceMappingURL=VolumeAttachment.js.map