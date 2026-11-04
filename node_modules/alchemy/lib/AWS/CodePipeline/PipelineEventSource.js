import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const DETAIL_TYPES = {
    execution: "CodePipeline Pipeline Execution State Change",
    stage: "CodePipeline Stage Execution State Change",
    action: "CodePipeline Action Execution State Change",
};
/**
 * Event source connecting CodePipeline execution notifications to the
 * hosting compute. CodePipeline publishes every pipeline, stage, and action
 * execution state change to the account's default EventBridge bus (source
 * `aws.codepipeline`); this subscribes the host Function to those events so
 * it can alert on failed deployments or chain post-release automation.
 *
 * CodePipeline publishes to EventBridge automatically — no additional
 * resource is created besides the EventBridge rule targeting the host.
 * Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Pipeline Events
 * **Example:** Alert On Failed Executions
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.CodePipeline.consumePipelineEvents(
 *       { kinds: ["execution"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           event.detail.state === "FAILED"
 *             ? Effect.log(`pipeline ${event.detail.pipeline} failed`)
 *             : Effect.void,
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumePipelineEvents = (props, process) => consumeBusEvents(props.id ?? "CodePipelineEvents", {
    source: ["aws.codepipeline"],
    "detail-type": (props.kinds ?? ["execution"]).map((kind) => DETAIL_TYPES[kind]),
    ...(props.pipelineNames !== undefined
        ? { detail: { pipeline: [...props.pipelineNames] } }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=PipelineEventSource.js.map