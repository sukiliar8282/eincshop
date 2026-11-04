import * as athena from "@distilled.cloud/aws/athena";
import * as Layer from "effect/Layer";
import { makeWorkGroupScopedHttpBinding } from "./BindingHttp.js";
import { GetQueryRuntimeStatistics } from "./GetQueryRuntimeStatistics.js";
export const GetQueryRuntimeStatisticsHttp = Layer.effect(GetQueryRuntimeStatistics, makeWorkGroupScopedHttpBinding({
    tag: "AWS.Athena.GetQueryRuntimeStatistics",
    operation: athena.getQueryRuntimeStatistics,
    actions: ["athena:GetQueryRuntimeStatistics"],
}));
//# sourceMappingURL=GetQueryRuntimeStatisticsHttp.js.map