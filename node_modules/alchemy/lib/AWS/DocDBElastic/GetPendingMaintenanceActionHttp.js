import * as docdbelastic from "@distilled.cloud/aws/docdb-elastic";
import * as Layer from "effect/Layer";
import { makeDocDBElasticAccountHttpBinding } from "./BindingHttp.js";
import { GetPendingMaintenanceAction } from "./GetPendingMaintenanceAction.js";
export const GetPendingMaintenanceActionHttp = Layer.effect(GetPendingMaintenanceAction, makeDocDBElasticAccountHttpBinding({
    tag: "AWS.DocDBElastic.GetPendingMaintenanceAction",
    operation: docdbelastic.getPendingMaintenanceAction,
    actions: ["docdb-elastic:GetPendingMaintenanceAction"],
}));
//# sourceMappingURL=GetPendingMaintenanceActionHttp.js.map