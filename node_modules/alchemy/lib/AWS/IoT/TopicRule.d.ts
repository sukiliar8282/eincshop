import * as iot from "@distilled.cloud/aws/iot";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export type Action = iot.Action;
export interface TopicRuleProps {
    /**
     * Name of the rule. Rule names may only contain letters, numbers, and
     * underscores (`[a-zA-Z0-9_]`). If omitted, a unique name is generated.
     * Changing it replaces the rule.
     */
    ruleName?: string;
    /**
     * The SQL statement used to query the topic, e.g.
     * `SELECT * FROM 'my/topic'`.
     */
    sql: string;
    /**
     * The actions associated with the rule (Lambda, SQS, SNS, republish, ...).
     */
    actions: Action[];
    /**
     * A textual description of the rule.
     */
    description?: string;
    /**
     * Whether the rule is disabled.
     * @default false
     */
    ruleDisabled?: boolean;
    /**
     * The version of the SQL rules engine to use (`2015-10-08` or `2016-03-23`).
     * @default "2016-03-23"
     */
    awsIotSqlVersion?: string;
    /**
     * The action to take when an error occurs.
     */
    errorAction?: Action;
    /**
     * User tags to attach to the rule.
     */
    tags?: Record<string, string>;
}
export interface TopicRule extends Resource<"AWS.IoT.TopicRule", TopicRuleProps, {
    /** The name of the rule. */
    ruleName: string;
    /** The ARN of the rule. */
    ruleArn: string;
}, never, Providers> {
}
/**
 * An AWS IoT topic rule — evaluates an SQL statement against messages
 * published to MQTT topics and routes matching messages to one or more
 * actions (invoke a Lambda, enqueue to SQS, republish, etc.).
 *
 * ### Creating a Rule
 * **Example:** Route Messages to a Lambda
 * ```typescript
 * const rule = yield* TopicRule("ingest", {
 *   sql: "SELECT * FROM 'sensors/+/telemetry'",
 *   actions: [{ lambda: { functionArn: yield* fn.functionArn } }],
 * });
 * ```
 *
 * @resource
 */
export declare const TopicRule: import("../../Resource.ts").ResourceClass<TopicRule>;
export declare const TopicRuleProvider: () => import("effect/Layer").Layer<Provider.Provider<TopicRule>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=TopicRule.d.ts.map