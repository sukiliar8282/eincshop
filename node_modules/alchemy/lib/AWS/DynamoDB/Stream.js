import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as Binding from "../../Binding.js";
export const TableEventSource = Binding.Service("AWS.DynamoDB.TableEventSource");
/**
 * Consume change data capture events from a DynamoDB table via a Lambda
 * event source mapping. The stream is enabled automatically through the
 * binding contract. The handler receives each delivered batch as an Effect
 * `Stream` of change records.
 *
 * Provide `Lambda.TableEventSource` on the Function to satisfy the binding.
 *
 * @example Log every table change
 * ```typescript
 * yield* DynamoDB.consumeTableChanges(
 *   table,
 *   { streamViewType: "NEW_AND_OLD_IMAGES", startingPosition: "TRIM_HORIZON" },
 *   (stream) =>
 *     stream.pipe(
 *       Stream.runForEach((record) =>
 *         Effect.log(`${record.eventName}: ${JSON.stringify(record.dynamodb.Keys)}`),
 *       ),
 *     ),
 * );
 * ```
 *
 * @example Forward changes to an SQS queue via QueueSink
 * ```typescript
 * const sink = yield* AWS.SQS.QueueSink(queue);
 *
 * yield* DynamoDB.consumeTableChanges(
 *   table,
 *   { streamViewType: "NEW_AND_OLD_IMAGES", batchSize: 10 },
 *   (stream) =>
 *     stream.pipe(
 *       Stream.map((record) => ({
 *         MessageBody: JSON.stringify({
 *           eventName: record.eventName,
 *           keys: record.dynamodb.Keys,
 *           newImage: record.dynamodb.NewImage,
 *         }),
 *       })),
 *       Stream.run(sink),
 *       Effect.orDie,
 *     ),
 * );
 * ```
 */
export const consumeTableChanges = (table, props = {}, handler) => TableEventSource.use((source) => source(table, props, handler));
//# sourceMappingURL=Stream.js.map