import * as mi from "@distilled.cloud/aws/iot-managed-integrations";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
import { syncManagedIntegrationsTags, toTagRecord } from "./internal.js";
/**
 * An AWS IoT Managed Integrations notification destination. Managed
 * integrations delivers lifecycle events and device notifications to the
 * destination (currently a Kinesis Data Stream) using the provided IAM role.
 *
 * IoT Managed Integrations is a regional service available in a limited set
 * of regions (e.g. `eu-west-1`, `ca-central-1`).
 *
 * ### Creating Destinations
 * **Example:** Kinesis Destination
 * ```typescript
 * const stream = yield* Kinesis.Stream("Events", {});
 * const role = yield* IAM.Role("DeliveryRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { Service: "iotmanagedintegrations.amazonaws.com" },
 *         Action: ["sts:AssumeRole"],
 *       },
 *     ],
 *   },
 * });
 * const destination = yield* Destination("EventDestination", {
 *   deliveryDestinationArn: stream.streamArn,
 *   roleArn: role.roleArn,
 *   description: "Managed integrations device events",
 * });
 * ```
 *
 * @resource
 */
export const Destination = Resource("AWS.IoTManagedIntegrations.Destination");
export const DestinationProvider = () => Provider.effect(Destination, Effect.gen(function* () {
    const toName = (id, props = {}) => props.name
        ? Effect.succeed(props.name)
        : createPhysicalName({ id, maxLength: 128 });
    const observe = (name) => mi
        .getDestination({ Name: name })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    // GetDestination does not return an ARN; the tag APIs need one, so
    // construct it from the ambient account/region.
    const destinationArn = Effect.fn(function* (name) {
        const { accountId, region } = yield* AWSEnvironment.current;
        return `arn:aws:iotmanagedintegrations:${region}:${accountId}:destination/${name}`;
    });
    const toAttributes = Effect.fn(function* (destination) {
        if (destination.Name === undefined ||
            destination.DeliveryDestinationArn === undefined ||
            destination.DeliveryDestinationType === undefined ||
            destination.RoleArn === undefined) {
            return yield* Effect.fail(new Error("destination response is missing required fields"));
        }
        return {
            destinationName: destination.Name,
            deliveryDestinationArn: destination.DeliveryDestinationArn,
            deliveryDestinationType: destination.DeliveryDestinationType,
            roleArn: destination.RoleArn,
            description: destination.Description,
            tags: toTagRecord(destination.Tags),
        };
    });
    return {
        stables: ["destinationName"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return;
            if ((yield* toName(id, olds ?? {})) !== (yield* toName(id, news ?? {}))) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.destinationName ?? (yield* toName(id, olds ?? {}));
            const destination = yield* observe(name);
            if (destination === undefined)
                return undefined;
            const attrs = yield* toAttributes(destination);
            return (yield* hasAlchemyTags(id, attrs.tags))
                ? attrs
                : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.destinationName ?? (yield* toName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            const desiredType = news.deliveryDestinationType ?? "KINESIS";
            // Observe — cloud state is authoritative.
            let destination = yield* observe(name);
            // Ensure — create if missing; tolerate a concurrent-create race.
            if (destination === undefined) {
                yield* mi
                    .createDestination({
                    Name: name,
                    DeliveryDestinationArn: news.deliveryDestinationArn,
                    DeliveryDestinationType: desiredType,
                    RoleArn: news.roleArn,
                    Description: news.description,
                    Tags: desiredTags,
                })
                    .pipe(Effect.catchTag("ConflictException", () => Effect.void));
                destination = yield* observe(name);
                if (destination === undefined) {
                    return yield* Effect.fail(new Error(`destination '${name}' vanished after create`));
                }
            }
            // Sync mutable settings — apply only the delta.
            if (destination.DeliveryDestinationArn !==
                news.deliveryDestinationArn ||
                destination.DeliveryDestinationType !== desiredType ||
                destination.RoleArn !== news.roleArn ||
                (destination.Description ?? undefined) !==
                    (news.description ?? undefined)) {
                yield* mi.updateDestination({
                    Name: name,
                    DeliveryDestinationArn: news.deliveryDestinationArn,
                    DeliveryDestinationType: desiredType,
                    RoleArn: news.roleArn,
                    Description: news.description,
                });
            }
            // Sync tags — diff against OBSERVED cloud tags.
            yield* syncManagedIntegrationsTags(yield* destinationArn(name), toTagRecord(destination.Tags), desiredTags);
            // Return fresh attributes.
            const final = yield* observe(name);
            if (final === undefined) {
                return yield* Effect.fail(new Error(`destination '${name}' vanished during reconcile`));
            }
            const attrs = yield* toAttributes(final);
            yield* session.note(attrs.destinationName);
            return attrs;
        }),
        // Enumerate every destination in the account/region; fetch each one to
        // resolve its tags (summaries omit them).
        list: () => Effect.gen(function* () {
            const summaries = yield* mi.listDestinations.items({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)));
            const destinations = yield* Effect.forEach(summaries.filter((s) => s.Name !== undefined), (summary) => observe(summary.Name), { concurrency: 5 });
            return yield* Effect.forEach(destinations.filter((d) => d !== undefined), toAttributes);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* mi
                .deleteDestination({ Name: output.destinationName })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=Destination.js.map