import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const DETAIL_TYPES = {
    "stream-state-change": "IVS Stream State Change",
    "recording-state-change": "IVS Recording State Change",
    "limit-breach": "IVS Limit Breach",
};
/**
 * Event source connecting Amazon IVS stream notifications to the hosting
 * compute. IVS publishes stream state changes (a broadcast starting or
 * ending), recording state changes (an S3 recording starting, completing,
 * or failing), and account limit breaches to the account's default
 * EventBridge bus (source `aws.ivs`); this subscribes the host Function
 * to those events so it can react to broadcasts going live or recordings
 * landing in S3.
 *
 * IVS publishes to EventBridge automatically — no additional resource is
 * created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on
 * the Function effect.
 *
 * ### Consuming Stream Events
 * **Example:** React When a Broadcast Starts
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default NotifyFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.IVS.consumeStreamEvents(
 *       { kinds: ["stream-state-change"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           event.detail.event_name === "Stream Start"
 *             ? Effect.log(`${event.detail.channel_name} went live`)
 *             : Effect.void,
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeStreamEvents = (props, process) => consumeBusEvents(props.id ?? "IVSStreamEvents", {
    source: ["aws.ivs"],
    "detail-type": (props.kinds ?? ["stream-state-change"]).map((kind) => DETAIL_TYPES[kind]),
    ...(props.channelArns !== undefined
        ? { resources: [...props.channelArns] }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=StreamEventSource.js.map