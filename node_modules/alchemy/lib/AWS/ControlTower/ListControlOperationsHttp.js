import * as controltower from "@distilled.cloud/aws/controltower";
import * as Layer from "effect/Layer";
import { makeControlTowerAccountHttpBinding } from "./BindingHttp.js";
import { ListControlOperations } from "./ListControlOperations.js";
export const ListControlOperationsHttp = Layer.effect(ListControlOperations, makeControlTowerAccountHttpBinding({
    capability: "ListControlOperations",
    iamActions: ["controltower:ListControlOperations"],
    operation: controltower.listControlOperations,
}));
//# sourceMappingURL=ListControlOperationsHttp.js.map