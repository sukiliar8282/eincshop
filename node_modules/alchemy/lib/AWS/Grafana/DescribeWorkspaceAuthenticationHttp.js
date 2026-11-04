import * as grafana from "@distilled.cloud/aws/grafana";
import * as Layer from "effect/Layer";
import { makeGrafanaWorkspaceHttpBinding } from "./BindingHttp.js";
import { DescribeWorkspaceAuthentication } from "./DescribeWorkspaceAuthentication.js";
export const DescribeWorkspaceAuthenticationHttp = Layer.effect(DescribeWorkspaceAuthentication, makeGrafanaWorkspaceHttpBinding({
    tag: "AWS.Grafana.DescribeWorkspaceAuthentication",
    operation: grafana.describeWorkspaceAuthentication,
    actions: ["grafana:DescribeWorkspaceAuthentication"],
}));
//# sourceMappingURL=DescribeWorkspaceAuthenticationHttp.js.map