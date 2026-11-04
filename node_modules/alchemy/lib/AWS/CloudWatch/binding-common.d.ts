import type { Alarm } from "./Alarm.ts";
import type { AlarmMuteRule } from "./AlarmMuteRule.ts";
import type { CompositeAlarm } from "./CompositeAlarm.ts";
import type { Dashboard } from "./Dashboard.ts";
import type { InsightRule } from "./InsightRule.ts";
import type { MetricStream } from "./MetricStream.ts";
export type AlarmResource = Alarm | CompositeAlarm;
export type InsightRuleResource = InsightRule;
export type TaggableResource = AlarmResource | Dashboard | MetricStream | InsightRule | AlarmMuteRule;
export declare const sortAlarmResources: (alarms: [AlarmResource, ...AlarmResource[]]) => [AlarmResource, ...AlarmResource[]];
export declare const sortInsightRuleResources: (rules: [InsightRuleResource, ...InsightRuleResource[]]) => [InsightRuleResource, ...InsightRuleResource[]];
export declare const getTaggableResourceArn: (resource: TaggableResource) => import("../../Output.ts").Output<`arn:aws:cloudwatch:${string}:${string}:alarm-mute-rule:${string}`, never> | import("../../Output.ts").Output<`arn:aws:cloudwatch:${string}:${string}:alarm:${string}`, never> | import("../../Output.ts").Output<`arn:aws:cloudwatch:${string}:${string}:insight-rule/${string}`, never> | import("../../Output.ts").Output<`arn:aws:cloudwatch:${string}:${string}:metric-stream/${string}`, never> | import("../../Output.ts").Output<`arn:aws:cloudwatch::${string}:dashboard/${string}`, never>;
//# sourceMappingURL=binding-common.d.ts.map