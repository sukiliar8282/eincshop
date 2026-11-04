import type { Volume as FlyVolume } from "@distilled.cloud/fly-io/machines";
import * as machines from "@distilled.cloud/fly-io/machines";
import * as Effect from "effect/Effect";
import type { DiskSpec } from "./MountVolume.ts";
export declare const DEFAULT_VOLUME_REGION = "iad";
export declare const MIN_SIZE_GB = 1;
declare const VolumeNotCreated_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.VolumeNotCreated";
} & Readonly<A>;
export declare class VolumeNotCreated extends VolumeNotCreated_base<{
    name: string;
    appName: string;
}> {
}
export declare const destroying: (state: string | undefined) => state is "destroyed" | "pending_destroy" | "scheduled_for_destruction";
export declare const getVolumeById: (appName: string, volumeId: string) => Effect.Effect<FlyVolume | undefined, import("@distilled.cloud/fly-io").Forbidden | machines.FlyIoOpError, machines.FlyIoOpContext>;
export declare const listVolumesByApp: (appName: string) => Effect.Effect<never[] | FlyVolume[], machines.FlyIoOpError, machines.FlyIoOpContext>;
export declare const listVolumeGroup: (appName: string, name: string, region: string) => Effect.Effect<FlyVolume[], machines.FlyIoOpError, machines.FlyIoOpContext>;
export declare const waitUntilVolumeReady: (appName: string, volumeId: string) => Effect.Effect<FlyVolume | undefined, import("@distilled.cloud/fly-io").Forbidden | machines.FlyIoOpError, machines.FlyIoOpContext>;
export declare const waitUntilVolumeGone: (appName: string, volumeId: string) => Effect.Effect<boolean, import("@distilled.cloud/fly-io").Forbidden | machines.FlyIoOpError, machines.FlyIoOpContext>;
export declare const pathKey: (path: string) => string;
export declare const volumeGroupName: (id: string, disk: Pick<DiskSpec, "path" | "name">) => Effect.Effect<string, never, import("../InstanceId.ts").InstanceId | import("../Stack.ts").Stack | import("../Stage.ts").Stage>;
export declare const createVolume: (input: {
    appName: string;
    name: string;
    region: string;
    disk: DiskSpec;
}) => Effect.Effect<FlyVolume, import("@distilled.cloud/fly-io").BadRequest | import("@distilled.cloud/fly-io").Forbidden | import("@distilled.cloud/fly-io").NotFound | VolumeNotCreated | machines.FlyIoOpError, machines.FlyIoOpContext>;
export declare const syncVolume: (appName: string, volume: FlyVolume, disk: DiskSpec) => Effect.Effect<FlyVolume, import("@distilled.cloud/fly-io").BadGateway | import("@distilled.cloud/fly-io").BadRequest | import("@distilled.cloud/fly-io").ConfigError | import("@distilled.cloud/fly-io").CreateExtensionTosAgreementNotAuthorized | import("@distilled.cloud/fly-io").FlyIoParseError | import("@distilled.cloud/fly-io").Forbidden | import("@distilled.cloud/fly-io").GatewayTimeout | import("effect/unstable/http/HttpClientError").HttpClientError | import("@distilled.cloud/fly-io").InternalServerError | import("@distilled.cloud/fly-io").NotFound | import("@distilled.cloud/fly-io").ServiceUnavailable | import("@distilled.cloud/fly-io").TooManyRequests | import("@distilled.cloud/fly-io").Unauthorized | import("@distilled.cloud/fly-io").UnknownFlyIoError, machines.FlyIoOpContext>;
/**
 * Observe-ensure-sync a Fly volume group (`name` shared, `count`
 * independent volumes). Extras are left in place for the caller to
 * delete after the Machines that mount them are gone.
 */
export declare const ensureVolumeGroup: (input: {
    appName: string;
    name: string;
    region: string;
    count: number;
    disk: DiskSpec;
    preferIds?: readonly string[];
}) => Effect.Effect<{
    volumes: FlyVolume[];
    extras: FlyVolume[];
}, import("@distilled.cloud/fly-io").BadRequest | import("@distilled.cloud/fly-io").Forbidden | import("@distilled.cloud/fly-io").NotFound | VolumeNotCreated | machines.FlyIoOpError, machines.FlyIoOpContext>;
export declare const deleteVolume: (appName: string, volumeId: string) => Effect.Effect<void, import("@distilled.cloud/fly-io").Conflict | import("@distilled.cloud/fly-io").Forbidden | machines.FlyIoOpError, machines.FlyIoOpContext>;
export declare const listOwnedVolumes: () => Effect.Effect<{
    appName: string;
    volumeId: string;
    volume: FlyVolume;
}[], import("./Environment.ts").FlyOrgNotFound | import("@distilled.cloud/fly-io").Forbidden | machines.FlyIoOpError, machines.FlyIoOpContext>;
export {};
//# sourceMappingURL=Volume.d.ts.map