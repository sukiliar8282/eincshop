import * as cloudwatch from "@distilled.cloud/aws/cloudwatch";
import * as Layer from "effect/Layer";
import { makeCloudWatchResourceSetHttpBinding } from "./BindingHttp.js";
import { DisableAlarmActions } from "./DisableAlarmActions.js";
export const DisableAlarmActionsHttp = Layer.effect(DisableAlarmActions, makeCloudWatchResourceSetHttpBinding({
    tag: "AWS.CloudWatch.DisableAlarmActions",
    operation: cloudwatch.disableAlarmActions,
    action: "cloudwatch:DisableAlarmActions",
    namesKey: "AlarmNames",
    name: (alarm) => alarm.alarmName,
    arn: (alarm) => alarm.alarmArn,
}));
//# sourceMappingURL=DisableAlarmActionsHttp.js.map