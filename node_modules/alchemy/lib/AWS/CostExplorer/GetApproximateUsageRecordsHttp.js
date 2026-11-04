import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Layer from "effect/Layer";
import { makeCostExplorerHttpBinding } from "./BindingHttp.js";
import { GetApproximateUsageRecords } from "./GetApproximateUsageRecords.js";
export const GetApproximateUsageRecordsHttp = Layer.effect(GetApproximateUsageRecords, makeCostExplorerHttpBinding({
    capability: "GetApproximateUsageRecords",
    iamActions: ["ce:GetApproximateUsageRecords"],
    operation: ce.getApproximateUsageRecords,
}));
//# sourceMappingURL=GetApproximateUsageRecordsHttp.js.map