import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Event source connecting CodeArtifact package version changes to the hosting
 * compute. CodeArtifact publishes an event to the account's default
 * EventBridge bus (source `aws.codeartifact`, detail-type `CodeArtifact
 * Package Version State Change`) every time a package version is created,
 * changes state (published, archived, disposed, …), or is deleted — including
 * versions ingested from upstream and external connections; this subscribes
 * the host Function to those events so it can react without polling.
 *
 * CodeArtifact publishes to EventBridge automatically — no additional
 * resource is created besides the EventBridge rule targeting the host.
 * Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Package Version Events
 * **Example:** React to Published Versions
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default ReleaseBot.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.CodeArtifact.consumePackageVersionStateChanges(
 *       { states: ["Published"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.log(
 *             `${event.detail.packageName}@${event.detail.packageVersion} → ${event.detail.packageVersionState}`,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumePackageVersionStateChanges = (props, process) => consumeBusEvents(props.id ?? "CodeArtifactPackageVersionStateChanges", {
    source: ["aws.codeartifact"],
    "detail-type": ["CodeArtifact Package Version State Change"],
    ...(props.domains || props.repositories || props.formats || props.states
        ? {
            detail: {
                ...(props.domains ? { domainName: [...props.domains] } : {}),
                ...(props.repositories
                    ? { repositoryName: [...props.repositories] }
                    : {}),
                ...(props.formats ? { packageFormat: [...props.formats] } : {}),
                ...(props.states
                    ? { packageVersionState: [...props.states] }
                    : {}),
            },
        }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=PackageVersionStateChangeEventSource.js.map