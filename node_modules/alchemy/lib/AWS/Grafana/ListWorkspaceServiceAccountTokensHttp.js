import * as grafana from "@distilled.cloud/aws/grafana";
import * as Layer from "effect/Layer";
import { makeGrafanaWorkspaceHttpBinding } from "./BindingHttp.js";
import { ListWorkspaceServiceAccountTokens } from "./ListWorkspaceServiceAccountTokens.js";
export const ListWorkspaceServiceAccountTokensHttp = Layer.effect(ListWorkspaceServiceAccountTokens, makeGrafanaWorkspaceHttpBinding({
    tag: "AWS.Grafana.ListWorkspaceServiceAccountTokens",
    operation: grafana.listWorkspaceServiceAccountTokens,
    actions: ["grafana:ListWorkspaceServiceAccountTokens"],
}));
//# sourceMappingURL=ListWorkspaceServiceAccountTokensHttp.js.map