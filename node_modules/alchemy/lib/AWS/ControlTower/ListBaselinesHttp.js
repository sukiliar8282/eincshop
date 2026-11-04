import * as controltower from "@distilled.cloud/aws/controltower";
import * as Layer from "effect/Layer";
import { makeControlTowerAccountHttpBinding } from "./BindingHttp.js";
import { ListBaselines } from "./ListBaselines.js";
export const ListBaselinesHttp = Layer.effect(ListBaselines, makeControlTowerAccountHttpBinding({
    capability: "ListBaselines",
    iamActions: ["controltower:ListBaselines"],
    operation: controltower.listBaselines,
}));
//# sourceMappingURL=ListBaselinesHttp.js.map