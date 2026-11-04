import * as codeconnections from "@distilled.cloud/aws/codeconnections";
import * as Layer from "effect/Layer";
import { makeSyncConfigurationScopedHttpBinding } from "./BindingHttp.js";
import { GetSyncBlockerSummary } from "./GetSyncBlockerSummary.js";
export const GetSyncBlockerSummaryHttp = Layer.effect(GetSyncBlockerSummary, makeSyncConfigurationScopedHttpBinding({
    tag: "AWS.CodeConnections.GetSyncBlockerSummary",
    actions: ["codeconnections:GetSyncBlockerSummary"],
    operation: codeconnections.getSyncBlockerSummary,
}));
//# sourceMappingURL=GetSyncBlockerSummaryHttp.js.map