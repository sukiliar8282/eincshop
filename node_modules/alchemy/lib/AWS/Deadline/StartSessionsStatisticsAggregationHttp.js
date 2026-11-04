import * as deadline from "@distilled.cloud/aws/deadline";
import * as Layer from "effect/Layer";
import { makeDeadlineFarmHttpBinding } from "./BindingHttp.js";
import { StartSessionsStatisticsAggregation } from "./StartSessionsStatisticsAggregation.js";
export const StartSessionsStatisticsAggregationHttp = Layer.effect(StartSessionsStatisticsAggregation, makeDeadlineFarmHttpBinding({
    tag: "AWS.Deadline.StartSessionsStatisticsAggregation",
    operation: deadline.startSessionsStatisticsAggregation,
    actions: ["deadline:StartSessionsStatisticsAggregation"],
}));
//# sourceMappingURL=StartSessionsStatisticsAggregationHttp.js.map