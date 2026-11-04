import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const DETAIL_TYPES = {
    rotation: "KMS CMK Rotation",
    deletion: "KMS CMK Deletion",
    "imported-key-material-expiration": "KMS Imported Key Material Expiration",
};
/**
 * Event source connecting AWS KMS notifications to the hosting compute. KMS
 * publishes key-material rotations, completed key deletions (the moment the
 * pending-deletion window elapses and the material is destroyed), and
 * imported key material expirations to the account's default EventBridge bus
 * (source `aws.kms`); this subscribes the host Function to those events so
 * it can audit rotations or react before/when a key becomes unusable.
 *
 * KMS publishes to EventBridge automatically — no additional resource is
 * created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on the
 * Function effect.
 *
 * ### Consuming Key Events
 * **Example:** Audit Rotations and Deletions
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AuditFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.KMS.consumeKeyEvents(
 *       { kinds: ["rotation", "deletion"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.logInfo(
 *             `${event["detail-type"]}: ${event.detail["key-id"]}`,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeKeyEvents = (props, process) => consumeBusEvents(props.id ?? "KMSKeyEvents", {
    source: ["aws.kms"],
    "detail-type": (props.kinds ??
        ["rotation", "deletion", "imported-key-material-expiration"]).map((kind) => DETAIL_TYPES[kind]),
    ...(props.keyArns !== undefined ? { resources: [...props.keyArns] } : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=KeyEventSource.js.map