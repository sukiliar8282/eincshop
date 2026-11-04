import * as deadline from "@distilled.cloud/aws/deadline";
import * as Layer from "effect/Layer";
import { makeDeadlineFarmHttpBinding } from "./BindingHttp.js";
import { GetSessionsStatisticsAggregation } from "./GetSessionsStatisticsAggregation.js";
export const GetSessionsStatisticsAggregationHttp = Layer.effect(GetSessionsStatisticsAggregation, makeDeadlineFarmHttpBinding({
    tag: "AWS.Deadline.GetSessionsStatisticsAggregation",
    operation: deadline.getSessionsStatisticsAggregation,
    actions: ["deadline:GetSessionsStatisticsAggregation"],
}));
//# sourceMappingURL=GetSessionsStatisticsAggregationHttp.js.map