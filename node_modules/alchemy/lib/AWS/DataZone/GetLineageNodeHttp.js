import * as datazone from "@distilled.cloud/aws/datazone";
import * as Layer from "effect/Layer";
import { makeDataZoneDomainHttpBinding } from "./BindingHttp.js";
import { GetLineageNode } from "./GetLineageNode.js";
export const GetLineageNodeHttp = Layer.effect(GetLineageNode, makeDataZoneDomainHttpBinding({
    tag: "AWS.DataZone.GetLineageNode",
    operation: datazone.getLineageNode,
    actions: ["datazone:GetLineageNode"],
}));
//# sourceMappingURL=GetLineageNodeHttp.js.map