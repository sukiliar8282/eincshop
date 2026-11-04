import type lambda from "aws-lambda";
import * as Layer from "effect/Layer";
import { TableEventSource as DynamoDBTableEventSource } from "../DynamoDB/Stream.ts";
import * as Lambda from "./Function.ts";
export declare const isDynamoDBStreamEvent: (event: any) => event is lambda.DynamoDBStreamEvent;
/** @binding */
export declare const TableEventSource: Layer.Layer<DynamoDBTableEventSource, never, Lambda.Function>;
//# sourceMappingURL=TableEventSource.d.ts.map