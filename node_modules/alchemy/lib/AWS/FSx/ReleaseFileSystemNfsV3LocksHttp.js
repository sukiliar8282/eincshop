import * as fsx from "@distilled.cloud/aws/fsx";
import * as Layer from "effect/Layer";
import { makeFSxFileSystemHttpBinding } from "./BindingHttp.js";
import { ReleaseFileSystemNfsV3Locks } from "./ReleaseFileSystemNfsV3Locks.js";
export const ReleaseFileSystemNfsV3LocksHttp = Layer.effect(ReleaseFileSystemNfsV3Locks, makeFSxFileSystemHttpBinding({
    tag: "AWS.FSx.ReleaseFileSystemNfsV3Locks",
    operation: fsx.releaseFileSystemNfsV3Locks,
    actions: ["fsx:ReleaseFileSystemNfsV3Locks"],
}));
//# sourceMappingURL=ReleaseFileSystemNfsV3LocksHttp.js.map