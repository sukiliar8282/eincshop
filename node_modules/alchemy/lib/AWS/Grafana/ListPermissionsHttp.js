import * as grafana from "@distilled.cloud/aws/grafana";
import * as Layer from "effect/Layer";
import { makeGrafanaWorkspaceHttpBinding } from "./BindingHttp.js";
import { ListPermissions } from "./ListPermissions.js";
export const ListPermissionsHttp = Layer.effect(ListPermissions, makeGrafanaWorkspaceHttpBinding({
    tag: "AWS.Grafana.ListPermissions",
    operation: grafana.listPermissions,
    actions: ["grafana:ListPermissions"],
}));
//# sourceMappingURL=ListPermissionsHttp.js.map