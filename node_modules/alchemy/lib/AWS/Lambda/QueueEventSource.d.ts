import type lambda from "aws-lambda";
import * as Layer from "effect/Layer";
import { QueueEventSource as SQSQueueEventSource } from "../SQS/QueueEventSource.ts";
import * as Lambda from "./Function.ts";
export declare const isSQSEvent: (event: any) => event is lambda.SQSEvent;
/** @binding */
export declare const QueueEventSource: Layer.Layer<SQSQueueEventSource, never, Lambda.Function>;
//# sourceMappingURL=QueueEventSource.d.ts.map