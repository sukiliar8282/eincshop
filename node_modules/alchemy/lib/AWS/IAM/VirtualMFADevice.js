import * as iam from "@distilled.cloud/aws/iam";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, createTagsList, diffTags } from "../../Tags.js";
import { toRedactedBytes, toTagRecord } from "./common.js";
/**
 * An IAM virtual MFA device.
 *
 * `VirtualMFADevice` creates a software MFA device and can optionally activate
 * it for a user during creation when the initial authentication codes are
 * provided.
 * ### Managing MFA Devices
 * **Example:** Create and Activate a Virtual MFA Device
 * ```typescript
 * const user = yield* User("AdminUser", {
 *   userName: "admin-user",
 * });
 *
 * const device = yield* VirtualMFADevice("AdminMfa", {
 *   userName: user.userName,
 *   authenticationCode1: "123456",
 *   authenticationCode2: "654321",
 * });
 * ```
 *
 * @resource
 */
export const VirtualMFADevice = Resource("AWS.IAM.VirtualMFADevice");
export const VirtualMFADeviceProvider = () => Provider.effect(VirtualMFADevice, Effect.gen(function* () {
    const toName = (id, props) => props.virtualMFADeviceName
        ? Effect.succeed(props.virtualMFADeviceName)
        : createPhysicalName({ id, maxLength: 226 });
    const readDevice = Effect.fn(function* ({ serialNumber, userName, }) {
        if (!userName) {
            const device = yield* iam.listVirtualMFADevices
                .items({ AssignmentStatus: "Unassigned" })
                .pipe(Stream.filter((entry) => entry.SerialNumber === serialNumber), Stream.runHead, Effect.map(Option.getOrUndefined));
            return device
                ? {
                    SerialNumber: device.SerialNumber,
                    UserName: device.User?.UserName,
                    EnableDate: device.EnableDate,
                }
                : undefined;
        }
        return yield* iam
            .getMFADevice({
            SerialNumber: serialNumber,
            UserName: userName,
        })
            .pipe(Effect.catchTag("NoSuchEntityException", () => Effect.succeed(undefined)));
    });
    return {
        stables: ["serialNumber"],
        list: () => Effect.gen(function* () {
            // Enumerate every virtual MFA device in the account. The list op
            // does not return tags, so hydrate them per-device via
            // listMFADeviceTags (matching the exact shape `read` returns).
            const devices = yield* iam.listVirtualMFADevices.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.VirtualMFADevices ?? [])));
            return yield* Effect.forEach(devices, (device) => Effect.gen(function* () {
                const tags = yield* iam
                    .listMFADeviceTags({
                    SerialNumber: device.SerialNumber,
                })
                    .pipe(Effect.map((resp) => resp.Tags), 
                // The device may vanish between listing and tag lookup.
                Effect.catchTag("NoSuchEntityException", () => Effect.succeed([])));
                return {
                    serialNumber: device.SerialNumber,
                    userName: device.User?.UserName,
                    enableDate: device.EnableDate,
                    // The seed and QR code are only returned at creation time
                    // and are never available from enumeration.
                    base32StringSeed: undefined,
                    qrCodePNG: undefined,
                    tags: toTagRecord(tags),
                };
            }), { concurrency: 10 });
        }),
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return;
            if ((yield* toName(id, olds ?? {})) !==
                (yield* toName(id, news)) ||
                (olds.path ?? "/") !== (news.path ?? "/") ||
                (olds.userName ?? undefined) !== (news.userName ?? undefined) ||
                (olds.authenticationCode1 ?? undefined) !==
                    (news.authenticationCode1 ?? undefined) ||
                (olds.authenticationCode2 ?? undefined) !==
                    (news.authenticationCode2 ?? undefined)) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ output }) {
            if (!output) {
                return undefined;
            }
            const response = yield* readDevice({
                serialNumber: output.serialNumber,
                userName: output.userName,
            });
            if (!response?.SerialNumber) {
                return undefined;
            }
            const tags = yield* iam.listMFADeviceTags({
                SerialNumber: output.serialNumber,
            });
            return {
                serialNumber: response.SerialNumber,
                userName: response.UserName ?? output.userName,
                enableDate: response.EnableDate,
                base32StringSeed: output.base32StringSeed,
                qrCodePNG: output.qrCodePNG,
                tags: toTagRecord(tags.Tags),
            };
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const desiredTags = {
                ...(yield* createInternalTags(id)),
                ...news.tags,
            };
            // Observe — virtual MFA devices have AWS-generated serial
            // numbers, so we can only locate the existing device when we
            // already have its serial from a prior output.
            const observed = output
                ? yield* readDevice({
                    serialNumber: output.serialNumber,
                    userName: output.userName,
                })
                : undefined;
            // Ensure — create the device when missing. The seed and QR
            // code are only returned on creation, so on adoption the best
            // we can do is preserve the existing redacted values.
            let serialNumber = observed?.SerialNumber ?? output?.serialNumber;
            let base32StringSeed = output?.base32StringSeed;
            let qrCodePNG = output?.qrCodePNG;
            if (!observed?.SerialNumber) {
                const deviceName = yield* toName(id, news);
                const created = yield* iam.createVirtualMFADevice({
                    Path: news.path,
                    VirtualMFADeviceName: deviceName,
                    Tags: createTagsList(desiredTags),
                });
                if (!created.VirtualMFADevice.SerialNumber) {
                    return yield* Effect.fail(new Error(`createVirtualMFADevice returned no serial number`));
                }
                serialNumber = created.VirtualMFADevice.SerialNumber;
                base32StringSeed = toRedactedBytes(created.VirtualMFADevice.Base32StringSeed);
                qrCodePNG = toRedactedBytes(created.VirtualMFADevice.QRCodePNG);
                // The device was just created, so it is unassigned. Activate
                // it for the user when activation codes are provided. After
                // first activation the codes lose their meaning (`diff`
                // triggers replacement on code change).
                if (news.userName &&
                    news.authenticationCode1 &&
                    news.authenticationCode2) {
                    yield* iam.enableMFADevice({
                        UserName: news.userName,
                        SerialNumber: serialNumber,
                        AuthenticationCode1: news.authenticationCode1,
                        AuthenticationCode2: news.authenticationCode2,
                    });
                }
            }
            if (!serialNumber) {
                return yield* Effect.fail(new Error(`Virtual MFA device has no serial number`));
            }
            // Sync tags against the cloud's actual tags.
            const observedTagsResp = yield* iam.listMFADeviceTags({
                SerialNumber: serialNumber,
            });
            const observedTags = toTagRecord(observedTagsResp.Tags);
            const { removed, upsert } = diffTags(observedTags, desiredTags);
            if (upsert.length > 0) {
                yield* iam.tagMFADevice({
                    SerialNumber: serialNumber,
                    Tags: upsert,
                });
            }
            if (removed.length > 0) {
                yield* iam.untagMFADevice({
                    SerialNumber: serialNumber,
                    TagKeys: removed,
                });
            }
            // Re-read for fresh `EnableDate` / `UserName` after activation.
            const fresh = yield* readDevice({
                serialNumber,
                userName: news.userName ?? output?.userName,
            });
            yield* session.note(serialNumber);
            return {
                serialNumber,
                userName: fresh?.UserName ?? news.userName ?? output?.userName,
                enableDate: fresh?.EnableDate ?? output?.enableDate,
                base32StringSeed,
                qrCodePNG,
                tags: desiredTags,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            if (output.userName) {
                yield* iam
                    .deactivateMFADevice({
                    UserName: output.userName,
                    SerialNumber: output.serialNumber,
                })
                    .pipe(Effect.catchTag("NoSuchEntityException", () => Effect.void));
            }
            yield* iam
                .deleteVirtualMFADevice({
                SerialNumber: output.serialNumber,
            })
                .pipe(Effect.catchTag("NoSuchEntityException", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=VirtualMFADevice.js.map