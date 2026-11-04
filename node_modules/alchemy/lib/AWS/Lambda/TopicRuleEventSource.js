import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
import * as Namespace from "../../Namespace.js";
import { sanitizeRuleName } from "../IoT/internal.js";
import { TopicRule } from "../IoT/TopicRule.js";
import { TopicRuleEventSource as IoTTopicRuleEventSource, } from "../IoT/TopicRuleEventSource.js";
import * as Lambda from "./Function.js";
import { Permission as LambdaPermission } from "./Permission.js";
/**
 * An IoT rule action delivers the raw SQL `SELECT` payload as the Lambda
 * event — an arbitrary JSON object. We discriminate it from the Records-based
 * AWS events (SQS/S3/SNS/DynamoDB) and from HTTP invocations (function URL /
 * API Gateway / ALB, which carry `requestContext`) so a single function can
 * host an IoT source alongside its HTTP handler.
 */
export const isIoTMessage = (event) => event != null &&
    typeof event === "object" &&
    !Array.isArray(event) &&
    !("Records" in event) &&
    !("requestContext" in event);
/** @binding */
export const TopicRuleEventSource = Layer.effect(IoTTopicRuleEventSource, 
// @effect-diagnostics-next-line missingEffectContext:off
Effect.gen(function* () {
    const host = yield* Lambda.Function;
    const Rule = yield* TopicRule;
    const Permission = yield* LambdaPermission;
    return Effect.fn(function* (topicFilter, props, process) {
        // Deploy-time: create the IoT topic rule with a Lambda action targeting
        // this function, and grant iot.amazonaws.com permission to invoke it
        // (scoped to the rule ARN). Skipped once running inside the deployed
        // function, where the only work is registering the runtime handler.
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            yield* Namespace.push(host.LogicalId, Effect.gen(function* () {
                const ruleName = props.ruleName ??
                    sanitizeRuleName(`${host.LogicalId}_${topicFilter}`);
                const rule = yield* Rule(`${host.LogicalId}-TopicRule`, {
                    ruleName,
                    sql: props.sql ?? `SELECT * FROM '${topicFilter}'`,
                    awsIotSqlVersion: props.awsIotSqlVersion,
                    actions: [{ lambda: { functionArn: host.functionArn } }],
                });
                yield* Permission(`AWS.IoT.TopicRuleInvoke(${ruleName})`, {
                    action: "lambda:InvokeFunction",
                    functionName: host.functionName,
                    principal: "iot.amazonaws.com",
                    sourceArn: rule.ruleArn,
                });
            }));
        }
        yield* host.listen(Effect.gen(function* () {
            return (event) => {
                if (isIoTMessage(event)) {
                    return process(Stream.fromArray([event])).pipe(Effect.orDie);
                }
            };
        }));
    });
}));
//# sourceMappingURL=TopicRuleEventSource.js.map