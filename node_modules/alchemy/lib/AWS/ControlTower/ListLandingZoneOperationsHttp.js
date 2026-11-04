import * as controltower from "@distilled.cloud/aws/controltower";
import * as Layer from "effect/Layer";
import { makeControlTowerAccountHttpBinding } from "./BindingHttp.js";
import { ListLandingZoneOperations } from "./ListLandingZoneOperations.js";
export const ListLandingZoneOperationsHttp = Layer.effect(ListLandingZoneOperations, makeControlTowerAccountHttpBinding({
    capability: "ListLandingZoneOperations",
    iamActions: ["controltower:ListLandingZoneOperations"],
    operation: controltower.listLandingZoneOperations,
}));
//# sourceMappingURL=ListLandingZoneOperationsHttp.js.map