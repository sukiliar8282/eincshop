import * as macie2 from "@distilled.cloud/aws/macie2";
import * as Layer from "effect/Layer";
import { makeMacie2HttpBinding } from "./BindingHttp.js";
import { GetUsageStatistics } from "./GetUsageStatistics.js";
export const GetUsageStatisticsHttp = Layer.effect(GetUsageStatistics, makeMacie2HttpBinding({
    tag: "AWS.Macie2.GetUsageStatistics",
    operation: macie2.getUsageStatistics,
    actions: ["macie2:GetUsageStatistics"],
}));
//# sourceMappingURL=GetUsageStatisticsHttp.js.map