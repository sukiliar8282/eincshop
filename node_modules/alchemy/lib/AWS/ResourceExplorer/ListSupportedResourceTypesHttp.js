import * as RE2 from "@distilled.cloud/aws/resource-explorer-2";
import * as Layer from "effect/Layer";
import { makeResourceExplorerAccountHttpBinding } from "./BindingHttp.js";
import { ListSupportedResourceTypes } from "./ListSupportedResourceTypes.js";
export const ListSupportedResourceTypesHttp = Layer.effect(ListSupportedResourceTypes, makeResourceExplorerAccountHttpBinding({
    tag: "AWS.ResourceExplorer.ListSupportedResourceTypes",
    operation: RE2.listSupportedResourceTypes,
    actions: ["resource-explorer-2:ListSupportedResourceTypes"],
}));
//# sourceMappingURL=ListSupportedResourceTypesHttp.js.map