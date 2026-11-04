import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
import * as S3 from "../AWS/S3/index.js";
import * as SQS from "../AWS/SQS/index.js";
import { SQSQueueEventSource } from "./SQSQueueEventSource.js";
/** @binding */
export const S3BucketEventSource = Layer.effect(S3.BucketEventSource, Effect.gen(function* () {
    const Queue = yield* SQS.Queue;
    return Effect.fn(function* (bucket, props, process) {
        const queue = yield* Queue(`${bucket.LogicalId}-BucketEvents`);
        // Deploy-time: grant the bucket sqs:SendMessage on the queue and attach the
        // bucket's notification config. Skipped once running inside the deployed
        // Function (the global guard); the runtime only registers the consumer below.
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            const events = props.events ?? ["s3:ObjectCreated:*"];
            yield* queue.bind(`AWS.SQS.SendMessage(${bucket.LogicalId})`, {
                policyStatements: [
                    {
                        Sid: `AllowS3EventsFrom${bucket.LogicalId}`,
                        Effect: "Allow",
                        Action: ["sqs:SendMessage"],
                        Resource: [queue.queueArn],
                        Condition: {
                            ArnEquals: {
                                "aws:SourceArn": bucket.bucketArn,
                            },
                        },
                    },
                ],
            });
            yield* bucket.bind(`AWS.S3.NotificationConfiguration(${queue.LogicalId})`, {
                notificationConfiguration: {
                    QueueConfigurations: [
                        {
                            QueueArn: queue.queueArn,
                            Events: events,
                        },
                    ],
                },
            });
        }
        yield* SQS.consumeQueueMessages(queue, (stream) => stream.pipe(Stream.flatMap((record) => Stream.fromArray(JSON.parse(record.body).Records)), Stream.map((event) => ({
            type: event.eventName,
            bucket: event.s3.bucket.name,
            key: event.s3.object.key,
            size: event.s3.object.size,
            eTag: event.s3.object.eTag,
        })), process));
    });
})).pipe(Layer.provideMerge(SQSQueueEventSource));
//# sourceMappingURL=S3BucketEventSource.js.map