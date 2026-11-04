import * as cloudwatch from "@distilled.cloud/aws/cloudwatch";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment, type AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type AlarmMuteRuleName = string;
export type AlarmMuteRuleArn = `arn:aws:cloudwatch:${RegionID}:${AccountID}:alarm-mute-rule:${string}`;
export interface AlarmMuteRuleProps extends Omit<cloudwatch.PutAlarmMuteRuleInput, "Name" | "Tags"> {
    /**
     * Name of the mute rule. If omitted, a unique name is generated.
     */
    name?: AlarmMuteRuleName;
    /**
     * Optional tags to apply to the mute rule.
     */
    tags?: Record<string, string>;
}
export interface AlarmMuteRule extends Resource<"AWS.CloudWatch.AlarmMuteRule", AlarmMuteRuleProps, {
    /** Physical name of the mute rule. */
    alarmMuteRuleName: AlarmMuteRuleName;
    /** ARN of the mute rule. */
    alarmMuteRuleArn: AlarmMuteRuleArn;
    /** Current status of the mute rule. */
    status: string | undefined;
    /** The mute type of the rule. */
    muteType: string | undefined;
    /** The full mute rule description as last read from CloudWatch. */
    alarmMuteRule: cloudwatch.GetAlarmMuteRuleOutput;
    /** Tags on the mute rule, including the internal Alchemy ownership tags. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A CloudWatch alarm mute rule — suppresses alarm actions on a recurring
 * schedule (e.g. maintenance windows) instead of manually disabling and
 * re-enabling alarm actions.
 * ### Creating Mute Rules
 * **Example:** Scheduled Mute
 * ```typescript
 * const rule = yield* AlarmMuteRule("NightlyMute", {
 *   Rule: {
 *     Schedule: {
 *       Expression: "0 2 * * SUN",
 *       Duration: "PT1H",
 *     },
 *   },
 * });
 * ```
 *
 * ### Reading Mute Rules at Runtime
 * **Example:** Read the Mute Rule from a Function
 * ```typescript
 * // init — bind the rule to the function (see GetAlarmMuteRule)
 * const getAlarmMuteRule = yield* AWS.CloudWatch.GetAlarmMuteRule(rule);
 *
 * // runtime
 * const result = yield* getAlarmMuteRule();
 * const schedule = result.Rule?.Schedule;
 * ```
 *
 * @resource
 */
export declare const AlarmMuteRule: import("../../Resource.ts").ResourceClass<AlarmMuteRule>;
export declare const AlarmMuteRuleProvider: () => import("effect/Layer").Layer<Provider.Provider<AlarmMuteRule>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=AlarmMuteRule.d.ts.map