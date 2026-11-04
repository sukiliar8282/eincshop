import * as fsx from "@distilled.cloud/aws/fsx";
import * as Layer from "effect/Layer";
import { makeFSxAccountHttpBinding } from "./BindingHttp.js";
import { RestoreVolumeFromSnapshot } from "./RestoreVolumeFromSnapshot.js";
export const RestoreVolumeFromSnapshotHttp = Layer.effect(RestoreVolumeFromSnapshot, makeFSxAccountHttpBinding({
    tag: "AWS.FSx.RestoreVolumeFromSnapshot",
    operation: fsx.restoreVolumeFromSnapshot,
    actions: ["fsx:RestoreVolumeFromSnapshot"],
}));
//# sourceMappingURL=RestoreVolumeFromSnapshotHttp.js.map