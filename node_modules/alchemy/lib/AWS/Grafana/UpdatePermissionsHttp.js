import * as grafana from "@distilled.cloud/aws/grafana";
import * as Layer from "effect/Layer";
import { makeGrafanaWorkspaceHttpBinding } from "./BindingHttp.js";
import { UpdatePermissions } from "./UpdatePermissions.js";
export const UpdatePermissionsHttp = Layer.effect(UpdatePermissions, makeGrafanaWorkspaceHttpBinding({
    tag: "AWS.Grafana.UpdatePermissions",
    operation: grafana.updatePermissions,
    actions: ["grafana:UpdatePermissions"],
}));
//# sourceMappingURL=UpdatePermissionsHttp.js.map