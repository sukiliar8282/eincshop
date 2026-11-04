import * as cloudwatch from "@distilled.cloud/aws/cloudwatch";
import * as Layer from "effect/Layer";
import { makeCloudWatchResourceSetHttpBinding } from "./BindingHttp.js";
import { EnableAlarmActions } from "./EnableAlarmActions.js";
export const EnableAlarmActionsHttp = Layer.effect(EnableAlarmActions, makeCloudWatchResourceSetHttpBinding({
    tag: "AWS.CloudWatch.EnableAlarmActions",
    operation: cloudwatch.enableAlarmActions,
    action: "cloudwatch:EnableAlarmActions",
    namesKey: "AlarmNames",
    name: (alarm) => alarm.alarmName,
    arn: (alarm) => alarm.alarmArn,
}));
//# sourceMappingURL=EnableAlarmActionsHttp.js.map