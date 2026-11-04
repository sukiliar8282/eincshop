import * as grafana from "@distilled.cloud/aws/grafana";
import * as Layer from "effect/Layer";
import { makeGrafanaWorkspaceHttpBinding } from "./BindingHttp.js";
import { DescribeWorkspaceConfiguration } from "./DescribeWorkspaceConfiguration.js";
export const DescribeWorkspaceConfigurationHttp = Layer.effect(DescribeWorkspaceConfiguration, makeGrafanaWorkspaceHttpBinding({
    tag: "AWS.Grafana.DescribeWorkspaceConfiguration",
    operation: grafana.describeWorkspaceConfiguration,
    actions: ["grafana:DescribeWorkspaceConfiguration"],
}));
//# sourceMappingURL=DescribeWorkspaceConfigurationHttp.js.map