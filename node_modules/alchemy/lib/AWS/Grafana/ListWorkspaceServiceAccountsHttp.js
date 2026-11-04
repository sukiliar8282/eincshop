import * as grafana from "@distilled.cloud/aws/grafana";
import * as Layer from "effect/Layer";
import { makeGrafanaWorkspaceHttpBinding } from "./BindingHttp.js";
import { ListWorkspaceServiceAccounts } from "./ListWorkspaceServiceAccounts.js";
export const ListWorkspaceServiceAccountsHttp = Layer.effect(ListWorkspaceServiceAccounts, makeGrafanaWorkspaceHttpBinding({
    tag: "AWS.Grafana.ListWorkspaceServiceAccounts",
    operation: grafana.listWorkspaceServiceAccounts,
    actions: ["grafana:ListWorkspaceServiceAccounts"],
}));
//# sourceMappingURL=ListWorkspaceServiceAccountsHttp.js.map