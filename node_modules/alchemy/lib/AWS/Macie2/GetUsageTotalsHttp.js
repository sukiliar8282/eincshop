import * as macie2 from "@distilled.cloud/aws/macie2";
import * as Layer from "effect/Layer";
import { makeMacie2HttpBinding } from "./BindingHttp.js";
import { GetUsageTotals } from "./GetUsageTotals.js";
export const GetUsageTotalsHttp = Layer.effect(GetUsageTotals, makeMacie2HttpBinding({
    tag: "AWS.Macie2.GetUsageTotals",
    operation: macie2.getUsageTotals,
    actions: ["macie2:GetUsageTotals"],
}));
//# sourceMappingURL=GetUsageTotalsHttp.js.map