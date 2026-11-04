import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const DETAIL_TYPES = {
    "stage-update": "IVS Stage Update",
    "composition-state-change": "IVS Composition State Change",
};
/**
 * Event source connecting Amazon IVS Real-Time Streaming notifications to
 * the hosting compute. IVS publishes stage updates (participants joining,
 * leaving, publishing, recording state changes) and composition state
 * changes to the account's default EventBridge bus (source `aws.ivs`); this
 * subscribes the host Function to those events so it can track presence,
 * kick off post-session processing, or alert on failed compositions.
 *
 * IVS publishes to EventBridge automatically — no additional resource is
 * created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on the
 * Function effect.
 *
 * ### Consuming Stage Events
 * **Example:** React to participants joining
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default PresenceFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.IVSRealtime.consumeStageEvents(
 *       { kinds: ["stage-update"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           event.detail.event_name === "Participant Joined"
 *             ? Effect.log(`joined: ${event.detail.participant_id}`)
 *             : Effect.void,
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeStageEvents = (props, process) => consumeBusEvents(props.id ?? "IVSRealtimeStageEvents", {
    source: ["aws.ivs"],
    "detail-type": (props.kinds ?? ["stage-update"]).map((kind) => DETAIL_TYPES[kind]),
    ...(props.stageArns !== undefined
        ? { resources: [...props.stageArns] }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=StageEventSource.js.map