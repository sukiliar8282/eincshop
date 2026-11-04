import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { consumeTopicNotifications, } from "../SNS/TopicEventSource.js";
import { EventTopic } from "./EventTopic.js";
const parseDirectoryStatus = (notification) => {
    let detail;
    try {
        const parsed = JSON.parse(notification.Message);
        detail =
            typeof parsed === "object" && parsed !== null
                ? parsed
                : undefined;
    }
    catch {
        detail = undefined;
    }
    return { notification, detail };
};
/**
 * Event source connecting an AWS Directory Service {@link Directory}'s
 * status notifications to the hosting Lambda function. Directory Service's
 * native event mechanism is Amazon SNS: at deploy time this registers the
 * directory as a publisher to the given {@link Topic} (an
 * {@link EventTopic} association) and subscribes the host function to the
 * topic; at runtime delivered status messages are dispatched to the
 * handler.
 *
 * Provide `AWS.Lambda.TopicEventSource` on the Function effect (the SNS
 * subscription machinery this event source delegates to).
 *
 * @example Alert When the Directory Becomes Impaired
 * ```typescript
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     const topic = yield* SNS.Topic("DirectoryStatus", {});
 *     const directory = yield* DirectoryService.Directory("Corp", { ... });
 *
 *     yield* DirectoryService.consumeDirectoryStatus(directory, topic, (events) =>
 *       Stream.runForEach(events, (event) =>
 *         Effect.logError(`directory status: ${event.notification.Message}`),
 *       ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(Lambda.TopicEventSource)),
 * );
 * ```
 */
export const consumeDirectoryStatus = (directory, topic, process) => Effect.gen(function* () {
    // Deploy-time: associate the directory with the SNS topic so status
    // changes are published to it.
    yield* EventTopic(`${directory.LogicalId}${topic.LogicalId}Status`, {
        directoryId: directory.directoryId,
        topicName: topic.topicName,
    });
    // Subscribe the host function to the topic and dispatch parsed status
    // messages to the handler.
    yield* consumeTopicNotifications(topic, (stream) => process(stream.pipe(Stream.map(parseDirectoryStatus))));
});
//# sourceMappingURL=DirectoryEventSource.js.map