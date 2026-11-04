import * as ds from "@distilled.cloud/aws/directory-service";
import * as Layer from "effect/Layer";
import { makeDirectoryHttpBinding } from "./BindingHttp.js";
import { GetSnapshotLimits } from "./GetSnapshotLimits.js";
export const GetSnapshotLimitsHttp = Layer.effect(GetSnapshotLimits, makeDirectoryHttpBinding({
    tag: "AWS.DirectoryService.GetSnapshotLimits",
    operation: ds.getSnapshotLimits,
    actions: ["ds:GetSnapshotLimits"],
}));
//# sourceMappingURL=GetSnapshotLimitsHttp.js.map