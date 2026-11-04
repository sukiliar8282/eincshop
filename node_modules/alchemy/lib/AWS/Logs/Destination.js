import * as logs from "@distilled.cloud/aws/cloudwatch-logs";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * A CloudWatch Logs destination — a cross-account subscription target that
 * forwards log events to a Kinesis stream. Producers in other accounts create
 * subscription filters whose `destinationArn` points at this destination;
 * the `accessPolicy` controls which accounts may subscribe.
 * ### Cross-Account Log Fan-Out
 * **Example:** Kinesis-Backed Destination
 * ```typescript
 * const destination = yield* Destination("CentralLogs", {
 *   targetArn: stream.streamArn,
 *   roleArn: role.roleArn,
 *   accessPolicy: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { AWS: "123456789012" },
 *         Action: ["logs:PutSubscriptionFilter"],
 *         Resource: "*",
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export const Destination = Resource("AWS.Logs.Destination");
/**
 * `putDestination` validates that CloudWatch Logs can assume the delivery role
 * at call time; when the role was created in the same deploy this fails with
 * `InvalidParameterException` until IAM propagates. Bounded retry.
 *
 * NOTE: explicit return annotation is load-bearing — an inlined `Effect.retry`
 * in provider lifecycle code widens the provider layer during declaration emit
 * (see PATTERNS.md §7).
 */
const retryThroughRolePropagation = (self) => Effect.retry(self, {
    while: (e) => e._tag === "InvalidParameterException" ||
        e._tag === "OperationAbortedException",
    schedule: Schedule.max([Schedule.fixed("3 seconds"), Schedule.recurs(9)]),
});
export const DestinationProvider = () => Provider.effect(Destination, Effect.gen(function* () {
    const toDestinationName = (id, props = {}) => props.destinationName
        ? Effect.succeed(props.destinationName)
        : createPhysicalName({ id, maxLength: 512 });
    const toPolicyString = (policy) => policy === undefined
        ? undefined
        : typeof policy === "string"
            ? policy
            : JSON.stringify(policy);
    const observe = Effect.fn(function* (destinationName) {
        return yield* logs.describeDestinations
            .items({ DestinationNamePrefix: destinationName })
            .pipe(Stream.filter((destination) => destination.destinationName === destinationName), Stream.runHead, Effect.map(Option.getOrUndefined));
    });
    return {
        stables: ["destinationName", "destinationArn"],
        list: () => logs.describeDestinations.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
            .flatMap((page) => page.destinations ?? [])
            .filter((destination) => destination.destinationName != null &&
            destination.arn != null)
            .map((destination) => ({
            destinationName: destination.destinationName,
            destinationArn: destination.arn,
            targetArn: destination.targetArn ?? "",
            roleArn: destination.roleArn ?? "",
            accessPolicy: destination.accessPolicy,
        })))),
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return;
            if ((yield* toDestinationName(id, olds)) !==
                (yield* toDestinationName(id, news))) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const destinationName = output?.destinationName ??
                (yield* toDestinationName(id, olds ?? {}));
            const observed = yield* observe(destinationName);
            if (!observed?.arn)
                return undefined;
            return {
                destinationName,
                destinationArn: observed.arn,
                targetArn: observed.targetArn ?? "",
                roleArn: observed.roleArn ?? "",
                accessPolicy: observed.accessPolicy,
            };
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const destinationName = output?.destinationName ?? (yield* toDestinationName(id, news));
            const desiredPolicy = toPolicyString(news.accessPolicy);
            // Observe — putDestination upserts by name; skip when target/role
            // already match.
            let observed = yield* observe(destinationName);
            if (observed?.targetArn !== news.targetArn ||
                observed?.roleArn !== news.roleArn) {
                const put = yield* retryThroughRolePropagation(logs.putDestination({
                    destinationName,
                    targetArn: news.targetArn,
                    roleArn: news.roleArn,
                }));
                observed = put.destination ?? (yield* observe(destinationName));
            }
            // Sync access policy against the observed policy.
            if (desiredPolicy !== undefined &&
                observed?.accessPolicy !== desiredPolicy) {
                yield* retryThroughRolePropagation(logs.putDestinationPolicy({
                    destinationName,
                    accessPolicy: desiredPolicy,
                }));
            }
            yield* session.note(destinationName);
            return {
                destinationName,
                destinationArn: observed?.arn ?? "",
                targetArn: news.targetArn,
                roleArn: news.roleArn,
                accessPolicy: desiredPolicy,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* logs
                .deleteDestination({ destinationName: output.destinationName })
                .pipe(Effect.retry({
                while: (error) => error._tag === "OperationAbortedException" ||
                    error._tag === "ServiceUnavailableException",
                schedule: Schedule.exponential(100),
                times: 8,
            }), Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=Destination.js.map