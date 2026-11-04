import * as cloudwatch from "@distilled.cloud/aws/cloudwatch";
import * as Layer from "effect/Layer";
import { makeCloudWatchAccountHttpBinding } from "./BindingHttp.js";
import { ListAlarmMuteRules } from "./ListAlarmMuteRules.js";
export const ListAlarmMuteRulesHttp = Layer.effect(ListAlarmMuteRules, makeCloudWatchAccountHttpBinding({
    tag: "AWS.CloudWatch.ListAlarmMuteRules",
    operation: cloudwatch.listAlarmMuteRules,
    actions: ["cloudwatch:ListAlarmMuteRules"],
}));
//# sourceMappingURL=ListAlarmMuteRulesHttp.js.map