import * as codeconnections from "@distilled.cloud/aws/codeconnections";
import * as Layer from "effect/Layer";
import { makeRepositoryLinkScopedHttpBinding } from "./BindingHttp.js";
import { ListSyncConfigurations } from "./ListSyncConfigurations.js";
export const ListSyncConfigurationsHttp = Layer.effect(ListSyncConfigurations, makeRepositoryLinkScopedHttpBinding({
    tag: "AWS.CodeConnections.ListSyncConfigurations",
    actions: ["codeconnections:ListSyncConfigurations"],
    operation: codeconnections.listSyncConfigurations,
}));
//# sourceMappingURL=ListSyncConfigurationsHttp.js.map