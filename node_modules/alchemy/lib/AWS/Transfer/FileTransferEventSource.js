import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const KIND_SUFFIXES = {
    "file-upload-completed": "Server File Upload Completed",
    "file-upload-failed": "Server File Upload Failed",
    "file-download-completed": "Server File Download Completed",
    "file-download-failed": "Server File Download Failed",
};
/**
 * Event source connecting AWS Transfer Family notifications to the hosting
 * compute. Transfer Family publishes file upload/download completions and
 * failures on its servers to the account's default EventBridge bus (source
 * `aws.transfer`); this subscribes the host Function to those events so it
 * can react the moment a partner drops a file on the SFTP endpoint.
 *
 * Transfer Family publishes to EventBridge automatically — no additional
 * resource is created besides the EventBridge rule targeting the host.
 * Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming File-Transfer Events
 * **Example:** Process Every Uploaded File
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default IngestFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.Transfer.consumeFileTransferEvents(
 *       { kinds: ["file-upload-completed"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.log(
 *             `${event.detail.username} uploaded a file on ${event.detail["server-id"]}`,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeFileTransferEvents = (props, process) => {
    const kinds = props.kinds ?? ["file-upload-completed"];
    const protocols = props.protocols ?? ["SFTP", "FTP", "FTPS"];
    return consumeBusEvents(props.id ?? "TransferFileTransferEvents", {
        source: ["aws.transfer"],
        "detail-type": protocols.flatMap((protocol) => kinds.map((kind) => `${protocol} ${KIND_SUFFIXES[kind]}`)),
        ...(props.serverArns !== undefined
            ? { resources: props.serverArns.map((arn) => ({ prefix: arn })) }
            : {}),
    }, { description: props.description, state: props.state }, process);
};
//# sourceMappingURL=FileTransferEventSource.js.map