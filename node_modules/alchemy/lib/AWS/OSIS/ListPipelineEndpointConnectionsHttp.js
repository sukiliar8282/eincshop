import * as osis from "@distilled.cloud/aws/osis";
import * as Layer from "effect/Layer";
import { makeOsisAccountHttpBinding } from "./BindingHttp.js";
import { ListPipelineEndpointConnections } from "./ListPipelineEndpointConnections.js";
export const ListPipelineEndpointConnectionsHttp = Layer.effect(ListPipelineEndpointConnections, makeOsisAccountHttpBinding({
    tag: "AWS.OSIS.ListPipelineEndpointConnections",
    operation: osis.listPipelineEndpointConnections,
    actions: ["osis:ListPipelineEndpointConnections"],
}));
//# sourceMappingURL=ListPipelineEndpointConnectionsHttp.js.map