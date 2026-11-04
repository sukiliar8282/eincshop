import * as aoss from "@distilled.cloud/aws/opensearchserverless";
import * as Layer from "effect/Layer";
import { makeAossAccountHttpBinding } from "./BindingHttp.js";
import { GetPoliciesStats } from "./GetPoliciesStats.js";
export const GetPoliciesStatsHttp = Layer.effect(GetPoliciesStats, makeAossAccountHttpBinding({
    tag: "AWS.OpenSearchServerless.GetPoliciesStats",
    operation: aoss.getPoliciesStats,
    actions: ["aoss:GetPoliciesStats"],
}));
//# sourceMappingURL=GetPoliciesStatsHttp.js.map