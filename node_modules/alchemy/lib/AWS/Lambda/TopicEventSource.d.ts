import type lambda from "aws-lambda";
import * as Layer from "effect/Layer";
import { TopicEventSource as SNSTopicEventSource } from "../SNS/TopicEventSource.ts";
import * as Lambda from "./Function.ts";
export declare const isSNSEvent: (event: any) => event is lambda.SNSEvent;
/** @binding */
export declare const TopicEventSource: Layer.Layer<SNSTopicEventSource, never, Lambda.Function>;
//# sourceMappingURL=TopicEventSource.d.ts.map