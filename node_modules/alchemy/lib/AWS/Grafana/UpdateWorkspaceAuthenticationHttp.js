import * as grafana from "@distilled.cloud/aws/grafana";
import * as Layer from "effect/Layer";
import { makeGrafanaWorkspaceHttpBinding } from "./BindingHttp.js";
import { UpdateWorkspaceAuthentication } from "./UpdateWorkspaceAuthentication.js";
export const UpdateWorkspaceAuthenticationHttp = Layer.effect(UpdateWorkspaceAuthentication, makeGrafanaWorkspaceHttpBinding({
    tag: "AWS.Grafana.UpdateWorkspaceAuthentication",
    operation: grafana.updateWorkspaceAuthentication,
    actions: ["grafana:UpdateWorkspaceAuthentication"],
}));
//# sourceMappingURL=UpdateWorkspaceAuthenticationHttp.js.map