import * as cloudwatch from "@distilled.cloud/aws/cloudwatch";
import * as Layer from "effect/Layer";
import { makeCloudWatchResourceHttpBinding } from "./BindingHttp.js";
import { GetAlarmMuteRule } from "./GetAlarmMuteRule.js";
export const GetAlarmMuteRuleHttp = Layer.effect(GetAlarmMuteRule, makeCloudWatchResourceHttpBinding({
    tag: "AWS.CloudWatch.GetAlarmMuteRule",
    operation: cloudwatch.getAlarmMuteRule,
    actions: ["cloudwatch:GetAlarmMuteRule"],
    requestKey: "AlarmMuteRuleName",
    identifier: (rule) => rule.alarmMuteRuleName,
    resourceArn: (rule) => rule.alarmMuteRuleArn,
}));
//# sourceMappingURL=GetAlarmMuteRuleHttp.js.map