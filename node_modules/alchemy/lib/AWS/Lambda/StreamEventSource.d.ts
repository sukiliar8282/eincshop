import type lambda from "aws-lambda";
import * as Layer from "effect/Layer";
import { StreamEventSource as KinesisStreamEventSource } from "../Kinesis/StreamEventSource.ts";
import * as Lambda from "./Function.ts";
export declare const isKinesisStreamEvent: (event: any) => event is lambda.KinesisStreamEvent;
/** @binding */
export declare const StreamEventSource: Layer.Layer<KinesisStreamEventSource, never, Lambda.Function>;
//# sourceMappingURL=StreamEventSource.d.ts.map