import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const DETAIL_TYPES = {
    "backup-job": "Backup Job State Change",
    "restore-job": "Restore Job State Change",
    "copy-job": "Copy Job State Change",
    "recovery-point": "Recovery Point State Change",
    "backup-vault": "Backup Vault State Change",
    "backup-plan": "Backup Plan State Change",
};
/**
 * Event source connecting AWS Backup state changes to the hosting compute.
 * AWS Backup publishes every backup / restore / copy job, recovery point,
 * vault, and plan state change to the account's default EventBridge bus
 * (source `aws.backup`); this subscribes the host Function to those events
 * so it can alert on failed jobs or chain post-backup automation.
 *
 * AWS Backup publishes to EventBridge automatically — no additional resource
 * is created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on the
 * Function effect.
 *
 * ### Consuming Backup Events
 * **Example:** Alert On Failed Backup Jobs
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.Backup.consumeBackupEvents(
 *       { kinds: ["backup-job"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           event.detail.state === "FAILED"
 *             ? Effect.log(`backup job ${event.detail.backupJobId} failed`)
 *             : Effect.void,
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeBackupEvents = (props, process) => consumeBusEvents(props.id ?? "BackupEvents", {
    source: ["aws.backup"],
    "detail-type": (props.kinds ?? Object.keys(DETAIL_TYPES)).map((kind) => DETAIL_TYPES[kind]),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=JobEventSource.js.map