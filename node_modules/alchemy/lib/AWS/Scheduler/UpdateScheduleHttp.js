import * as scheduler from "@distilled.cloud/aws/scheduler";
import * as Layer from "effect/Layer";
import { makeScheduleWriteHttpBinding } from "./BindingHttp.js";
import { UpdateSchedule } from "./UpdateSchedule.js";
export const UpdateScheduleHttp = Layer.effect(UpdateSchedule, makeScheduleWriteHttpBinding({
    tag: "AWS.Scheduler.UpdateSchedule",
    operation: scheduler.updateSchedule,
    actions: ["scheduler:UpdateSchedule"],
}));
//# sourceMappingURL=UpdateScheduleHttp.js.map