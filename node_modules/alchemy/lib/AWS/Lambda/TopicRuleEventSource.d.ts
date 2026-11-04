import * as Layer from "effect/Layer";
import { type IoTMessage, TopicRuleEventSource as IoTTopicRuleEventSource } from "../IoT/TopicRuleEventSource.ts";
import * as Lambda from "./Function.ts";
/**
 * An IoT rule action delivers the raw SQL `SELECT` payload as the Lambda
 * event — an arbitrary JSON object. We discriminate it from the Records-based
 * AWS events (SQS/S3/SNS/DynamoDB) and from HTTP invocations (function URL /
 * API Gateway / ALB, which carry `requestContext`) so a single function can
 * host an IoT source alongside its HTTP handler.
 */
export declare const isIoTMessage: (event: any) => event is IoTMessage;
/** @binding */
export declare const TopicRuleEventSource: Layer.Layer<IoTTopicRuleEventSource, never, Lambda.Function>;
//# sourceMappingURL=TopicRuleEventSource.d.ts.map