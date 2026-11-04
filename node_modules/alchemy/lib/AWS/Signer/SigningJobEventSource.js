import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Event source connecting AWS Signer notifications to the hosting compute.
 * Signer publishes signing-job status changes to the account's default
 * EventBridge bus (source `aws.signer`, detail-type `Signer Job Status
 * Change`); this subscribes the host Function to those events so it can
 * react when a code-signing job starts, succeeds, or fails.
 *
 * Signer publishes to EventBridge automatically — no additional resource is
 * created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on the
 * Function effect.
 *
 * ### Consuming Signing Job Events
 * **Example:** React When Signing Fails
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.Signer.consumeSigningJobEvents(
 *       { statuses: ["Failed"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.logError(`signing job ${event.detail.job_id} failed`),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeSigningJobEvents = (props, process) => consumeBusEvents(props.id ?? "SignerJobEvents", {
    source: ["aws.signer"],
    "detail-type": ["Signer Job Status Change"],
    ...(props.statuses !== undefined
        ? { detail: { status: [...props.statuses] } }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=SigningJobEventSource.js.map