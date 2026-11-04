import * as qapps from "@distilled.cloud/aws/qapps";
import * as Layer from "effect/Layer";
import { makeQAppsInstanceHttpBinding } from "./BindingHttp.js";
import { GetLibraryItem } from "./GetLibraryItem.js";
export const GetLibraryItemHttp = Layer.effect(GetLibraryItem, makeQAppsInstanceHttpBinding({
    capability: "GetLibraryItem",
    iamActions: ["qapps:GetLibraryItem"],
    operation: qapps.getLibraryItem,
}));
//# sourceMappingURL=GetLibraryItemHttp.js.map