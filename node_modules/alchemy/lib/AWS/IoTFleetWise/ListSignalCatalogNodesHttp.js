import * as iotfleetwise from "@distilled.cloud/aws/iotfleetwise";
import * as Layer from "effect/Layer";
import { makeFleetWiseResourceHttpBinding } from "./BindingHttp.js";
import { ListSignalCatalogNodes } from "./ListSignalCatalogNodes.js";
export const ListSignalCatalogNodesHttp = Layer.effect(ListSignalCatalogNodes, makeFleetWiseResourceHttpBinding({
    tag: "AWS.IoTFleetWise.ListSignalCatalogNodes",
    operation: iotfleetwise.listSignalCatalogNodes,
    actions: ["iotfleetwise:ListSignalCatalogNodes"],
    requestKey: "name",
    identifier: (catalog) => catalog.signalCatalogName,
    resources: (catalog) => [catalog.signalCatalogArn],
}));
//# sourceMappingURL=ListSignalCatalogNodesHttp.js.map