import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const DETAIL_TYPES = {
    created: "Bedrock Data Automation Job Created",
    succeeded: "Bedrock Data Automation Job Succeeded",
    "client-error": "Bedrock Data Automation Job Failed With Client Error",
    "service-error": "Bedrock Data Automation Job Failed With Service Error",
};
/**
 * Event source connecting Bedrock Data Automation job state changes to the
 * hosting compute. Jobs started via `InvokeDataAutomationAsync` with
 * `notificationConfiguration.eventBridgeConfiguration.eventBridgeEnabled`
 * publish created / succeeded / failed events to the account's default
 * EventBridge bus (source `aws.bedrock`); this subscribes the host Function
 * to those events so it can pick up results the moment a job settles.
 *
 * Bedrock publishes to EventBridge directly — no additional resource is
 * created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on the
 * Function effect.
 *
 * ### Consuming Job Events
 * **Example:** Process Results When A Job Succeeds
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default ResultsFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.BedrockDataAutomation.consumeDataAutomationJobEvents(
 *       { kinds: ["succeeded", "client-error", "service-error"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           event.detail.job_status === "SUCCESS"
 *             ? Effect.log(
 *                 `job ${event.detail.job_id} wrote ${event.detail.output_s3_location?.name}`,
 *               )
 *             : Effect.log(`job failed: ${event.detail.error_message}`),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeDataAutomationJobEvents = (props, process) => consumeBusEvents(props.id ?? "DataAutomationJobEvents", {
    source: ["aws.bedrock"],
    "detail-type": (props.kinds ??
        Object.keys(DETAIL_TYPES)).map((kind) => DETAIL_TYPES[kind]),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=JobEventSource.js.map