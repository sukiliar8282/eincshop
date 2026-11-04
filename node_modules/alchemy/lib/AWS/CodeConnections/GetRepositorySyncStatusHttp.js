import * as codeconnections from "@distilled.cloud/aws/codeconnections";
import * as Layer from "effect/Layer";
import { makeRepositoryLinkScopedHttpBinding } from "./BindingHttp.js";
import { GetRepositorySyncStatus } from "./GetRepositorySyncStatus.js";
export const GetRepositorySyncStatusHttp = Layer.effect(GetRepositorySyncStatus, makeRepositoryLinkScopedHttpBinding({
    tag: "AWS.CodeConnections.GetRepositorySyncStatus",
    actions: ["codeconnections:GetRepositorySyncStatus"],
    operation: codeconnections.getRepositorySyncStatus,
}));
//# sourceMappingURL=GetRepositorySyncStatusHttp.js.map