import type lambda from "aws-lambda";
import * as Layer from "effect/Layer";
import { KafkaEventSource as MSKKafkaEventSource } from "../Kafka/ClusterEventSource.ts";
import * as Lambda from "./Function.ts";
export declare const isMSKEvent: (event: any) => event is lambda.MSKEvent;
/** @binding */
export declare const KafkaEventSource: Layer.Layer<MSKKafkaEventSource, never, Lambda.Function>;
//# sourceMappingURL=KafkaEventSource.d.ts.map