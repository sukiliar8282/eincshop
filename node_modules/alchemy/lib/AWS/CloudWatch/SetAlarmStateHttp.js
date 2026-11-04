import * as cloudwatch from "@distilled.cloud/aws/cloudwatch";
import * as Layer from "effect/Layer";
import { makeCloudWatchResourceHttpBinding } from "./BindingHttp.js";
import { SetAlarmState } from "./SetAlarmState.js";
export const SetAlarmStateHttp = Layer.effect(SetAlarmState, makeCloudWatchResourceHttpBinding({
    tag: "AWS.CloudWatch.SetAlarmState",
    operation: cloudwatch.setAlarmState,
    actions: ["cloudwatch:SetAlarmState"],
    requestKey: "AlarmName",
    identifier: (alarm) => alarm.alarmName,
    resourceArn: (alarm) => alarm.alarmArn,
}));
//# sourceMappingURL=SetAlarmStateHttp.js.map