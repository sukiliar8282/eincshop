import * as qapps from "@distilled.cloud/aws/qapps";
import * as Layer from "effect/Layer";
import { makeQAppsInstanceHttpBinding } from "./BindingHttp.js";
import { UpdateLibraryItem } from "./UpdateLibraryItem.js";
export const UpdateLibraryItemHttp = Layer.effect(UpdateLibraryItem, makeQAppsInstanceHttpBinding({
    capability: "UpdateLibraryItem",
    iamActions: ["qapps:UpdateLibraryItem"],
    operation: qapps.updateLibraryItem,
}));
//# sourceMappingURL=UpdateLibraryItemHttp.js.map