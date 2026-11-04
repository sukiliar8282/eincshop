import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as Binding from "../../Binding.js";
export const StreamEventSource = Binding.Service("AWS.Kinesis.StreamEventSource");
/**
 * Subscribe a runtime to records from a Kinesis stream.
 *
 * The Lambda runtime implementation creates an event source mapping and forwards
 * matching `aws:kinesis` records into the supplied `Stream`.
 *
 * @example Forward stream records into an SQS queue
 * ```typescript
 * const sink = yield* AWS.SQS.QueueSink(queue);
 *
 * yield* AWS.Kinesis.consumeStreamRecords(
 *   stream,
 *   { startingPosition: "LATEST" },
 *   (records) =>
 *     records.pipe(
 *       Stream.map((record) => ({
 *         MessageBody: Buffer.from(record.kinesis.data, "base64").toString("utf8"),
 *       })),
 *       Stream.run(sink),
 *       Effect.orDie,
 *     ),
 * );
 * ```
 */
export const consumeStreamRecords = (stream, props = {}, process) => StreamEventSource.use((source) => source(stream, props, process));
//# sourceMappingURL=StreamEventSource.js.map