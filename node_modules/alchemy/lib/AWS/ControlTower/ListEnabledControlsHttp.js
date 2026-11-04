import * as controltower from "@distilled.cloud/aws/controltower";
import * as Layer from "effect/Layer";
import { makeControlTowerAccountHttpBinding } from "./BindingHttp.js";
import { ListEnabledControls } from "./ListEnabledControls.js";
export const ListEnabledControlsHttp = Layer.effect(ListEnabledControls, makeControlTowerAccountHttpBinding({
    capability: "ListEnabledControls",
    iamActions: ["controltower:ListEnabledControls"],
    operation: controltower.listEnabledControls,
}));
//# sourceMappingURL=ListEnabledControlsHttp.js.map