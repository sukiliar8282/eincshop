import * as scheduler from "@distilled.cloud/aws/scheduler";
import * as Layer from "effect/Layer";
import { makeScheduleGroupScopedHttpBinding } from "./BindingHttp.js";
import { GetSchedule } from "./GetSchedule.js";
export const GetScheduleHttp = Layer.effect(GetSchedule, makeScheduleGroupScopedHttpBinding({
    tag: "AWS.Scheduler.GetSchedule",
    operation: scheduler.getSchedule,
    actions: ["scheduler:GetSchedule"],
}));
//# sourceMappingURL=GetScheduleHttp.js.map