import * as codeconnections from "@distilled.cloud/aws/codeconnections";
import * as Layer from "effect/Layer";
import { makeSyncConfigurationScopedHttpBinding } from "./BindingHttp.js";
import { GetResourceSyncStatus } from "./GetResourceSyncStatus.js";
export const GetResourceSyncStatusHttp = Layer.effect(GetResourceSyncStatus, makeSyncConfigurationScopedHttpBinding({
    tag: "AWS.CodeConnections.GetResourceSyncStatus",
    actions: ["codeconnections:GetResourceSyncStatus"],
    operation: codeconnections.getResourceSyncStatus,
}));
//# sourceMappingURL=GetResourceSyncStatusHttp.js.map