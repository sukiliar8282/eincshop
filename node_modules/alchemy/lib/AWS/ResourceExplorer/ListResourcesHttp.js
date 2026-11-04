import * as RE2 from "@distilled.cloud/aws/resource-explorer-2";
import * as Layer from "effect/Layer";
import { makeResourceExplorerViewHttpBinding } from "./BindingHttp.js";
import { ListResources } from "./ListResources.js";
export const ListResourcesHttp = Layer.effect(ListResources, makeResourceExplorerViewHttpBinding({
    tag: "AWS.ResourceExplorer.ListResources",
    operation: RE2.listResources,
    actions: ["resource-explorer-2:ListResources"],
}));
//# sourceMappingURL=ListResourcesHttp.js.map