import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const DETAIL_TYPES = {
    "schema-created": "Schema Created",
    "schema-version-created": "Schema Version Created",
};
/**
 * Event source connecting EventBridge schema-registry notifications to the
 * hosting compute. The registry publishes `Schema Created` and
 * `Schema Version Created` events to the account's default bus (source
 * `aws.schemas`) whenever a schema is registered — including schemas the
 * discoverer infers from live traffic — so a function can react to new or
 * drifting event contracts (regenerate types, notify consumers, run
 * compatibility checks).
 *
 * The registry publishes to EventBridge automatically — no additional
 * resource is created besides the EventBridge rule targeting the host.
 * Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Schema Registry Events
 * **Example:** React To New Schema Versions
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default ContractWatcher.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.Schemas.consumeSchemaEvents(
 *       { kinds: ["schema-version-created"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.log(
 *             `schema ${event.detail.RegistryName}/${event.detail.SchemaName} ` +
 *               `published version ${event.detail.SchemaVersion}`,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeSchemaEvents = (props, process) => consumeBusEvents(props.id ?? "SchemasEvents", {
    source: ["aws.schemas"],
    "detail-type": (props.kinds ?? ["schema-created", "schema-version-created"]).map((kind) => DETAIL_TYPES[kind]),
    ...(props.registryNames !== undefined
        ? { detail: { RegistryName: [...props.registryNames] } }
        : {}),
    ...(props.schemaArns !== undefined
        ? { resources: [...props.schemaArns] }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=SchemaEventSource.js.map