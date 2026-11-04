import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { type TopicNotification } from "../SNS/TopicEventSource.ts";
import type { Topic } from "../SNS/Topic.ts";
import type { Directory } from "./Directory.ts";
/**
 * A directory status notification delivered to the handler. Directory
 * Service publishes a message whenever the directory changes stage — e.g.
 * from `Active` to `Impaired` or `Inoperable`, and back to `Active`.
 */
export interface DirectoryStatusEvent {
    /** The raw SNS notification as delivered. */
    notification: TopicNotification;
    /**
     * The parsed JSON body of the notification, when the message is JSON
     * (AWS does not document a strict schema for directory status messages).
     */
    detail: Record<string, unknown> | undefined;
}
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
export declare const consumeDirectoryStatus: <StreamReq = never, Req = never>(directory: Directory, topic: Topic, process: (events: Stream.Stream<DirectoryStatusEvent, never, StreamReq>) => Effect.Effect<void, never, Req>) => Effect.Effect<void, never, import("../Providers.ts").Providers | import("../SNS/TopicEventSource.ts").TopicEventSource>;
//# sourceMappingURL=DirectoryEventSource.d.ts.map