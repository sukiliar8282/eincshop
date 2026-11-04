import * as aa from "@distilled.cloud/aws/accessanalyzer";
import * as Layer from "effect/Layer";
import { makeAnalyzerScopedHttpBinding } from "./BindingHttp.js";
import { GetFindingsStatistics } from "./GetFindingsStatistics.js";
export const GetFindingsStatisticsHttp = Layer.effect(GetFindingsStatistics, makeAnalyzerScopedHttpBinding({
    tag: "AWS.AccessAnalyzer.GetFindingsStatistics",
    operation: aa.getFindingsStatistics,
    actions: ["access-analyzer:GetFindingsStatistics"],
}));
//# sourceMappingURL=GetFindingsStatisticsHttp.js.map