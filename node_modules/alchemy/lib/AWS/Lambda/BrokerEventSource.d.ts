import * as Layer from "effect/Layer";
import { BrokerEventSource as MQBrokerEventSource, type MQEvent } from "../MQ/BrokerEventSource.ts";
import * as Lambda from "./Function.ts";
/** Narrow an incoming Lambda event to an Amazon MQ (ActiveMQ/RabbitMQ) event. */
export declare const isMQEvent: (event: any) => event is MQEvent;
/** @binding */
export declare const BrokerEventSource: Layer.Layer<MQBrokerEventSource, never, Lambda.Function>;
//# sourceMappingURL=BrokerEventSource.d.ts.map