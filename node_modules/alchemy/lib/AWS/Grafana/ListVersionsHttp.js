import * as grafana from "@distilled.cloud/aws/grafana";
import * as Layer from "effect/Layer";
import { makeGrafanaAccountHttpBinding } from "./BindingHttp.js";
import { ListVersions } from "./ListVersions.js";
export const ListVersionsHttp = Layer.effect(ListVersions, makeGrafanaAccountHttpBinding({
    tag: "AWS.Grafana.ListVersions",
    operation: grafana.listVersions,
    actions: ["grafana:ListVersions"],
}));
//# sourceMappingURL=ListVersionsHttp.js.map