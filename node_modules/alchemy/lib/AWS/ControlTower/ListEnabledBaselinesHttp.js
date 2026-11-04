import * as controltower from "@distilled.cloud/aws/controltower";
import * as Layer from "effect/Layer";
import { makeControlTowerAccountHttpBinding } from "./BindingHttp.js";
import { ListEnabledBaselines } from "./ListEnabledBaselines.js";
export const ListEnabledBaselinesHttp = Layer.effect(ListEnabledBaselines, makeControlTowerAccountHttpBinding({
    capability: "ListEnabledBaselines",
    iamActions: ["controltower:ListEnabledBaselines"],
    operation: controltower.listEnabledBaselines,
}));
//# sourceMappingURL=ListEnabledBaselinesHttp.js.map