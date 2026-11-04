import * as iotfleetwise from "@distilled.cloud/aws/iotfleetwise";
import * as Layer from "effect/Layer";
import { makeFleetWiseResourceHttpBinding } from "./BindingHttp.js";
import { ListModelManifestNodes } from "./ListModelManifestNodes.js";
export const ListModelManifestNodesHttp = Layer.effect(ListModelManifestNodes, makeFleetWiseResourceHttpBinding({
    tag: "AWS.IoTFleetWise.ListModelManifestNodes",
    operation: iotfleetwise.listModelManifestNodes,
    actions: ["iotfleetwise:ListModelManifestNodes"],
    requestKey: "name",
    identifier: (model) => model.modelManifestName,
    resources: (model) => [model.modelManifestArn],
}));
//# sourceMappingURL=ListModelManifestNodesHttp.js.map