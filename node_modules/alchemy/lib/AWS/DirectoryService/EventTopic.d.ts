import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface EventTopicProps {
    /**
     * Id of the {@link Directory} whose status notifications are published.
     * Changing the directory replaces the association.
     */
    directoryId: string;
    /**
     * Name of the Amazon SNS topic (same account and region) the directory
     * publishes status messages to. Changing the topic replaces the
     * association.
     */
    topicName: string;
}
export interface EventTopic extends Resource<"AWS.DirectoryService.EventTopic", EventTopicProps, {
    /** The ID of the directory publishing status notifications. */
    directoryId: string;
    /** The name of the SNS topic receiving status notifications. */
    topicName: string;
    /** The ARN of the SNS topic receiving status notifications. */
    topicArn: string | undefined;
    /** The status of the association, e.g. `Registered`. */
    status: string | undefined;
}, never, Providers> {
}
/**
 * An association between an AWS Directory Service {@link Directory} and an
 * Amazon SNS topic. The directory publishes a status message to the topic
 * whenever it changes stage — e.g. from `Active` to `Impaired` or
 * `Inoperable`, and back to `Active` — which is Directory Service's native
 * event mechanism.
 *
 * To consume the notifications from a Lambda function, use
 * {@link consumeDirectoryStatus}, which creates this association and
 * subscribes the function to the topic.
 * ### Publishing Directory Status Notifications
 * **Example:** Publish Status Changes to an SNS Topic
 * ```typescript
 * const topic = yield* SNS.Topic("DirectoryStatus", {});
 * const eventTopic = yield* DirectoryService.EventTopic("Status", {
 *   directoryId: directory.directoryId,
 *   topicName: topic.topicName,
 * });
 * ```
 *
 * @resource
 */
export declare const EventTopic: import("../../Resource.ts").ResourceClass<EventTopic>;
export declare const EventTopicProvider: () => import("effect/Layer").Layer<Provider.Provider<EventTopic>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=EventTopic.d.ts.map