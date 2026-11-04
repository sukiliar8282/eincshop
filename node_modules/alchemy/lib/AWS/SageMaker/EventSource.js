import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const DETAIL_TYPES = {
    endpoint: "SageMaker Endpoint State Change",
    "endpoint-deployment": "SageMaker Endpoint Deployment State Change",
    "feature-group": "SageMaker Feature Group State Change",
    "model-package": "SageMaker Model Package State Change",
    "training-job": "SageMaker Training Job State Change",
    "processing-job": "SageMaker Processing Job State Change",
    "transform-job": "SageMaker Transform Job State Change",
    "hyperparameter-tuning-job": "SageMaker HyperParameter Tuning Job State Change",
    "pipeline-execution": "SageMaker Model Building Pipeline Execution Status Change",
    "pipeline-step": "SageMaker Model Building Pipeline Execution Step Status Change",
    image: "SageMaker Image State Change",
};
/**
 * Event source connecting Amazon SageMaker state changes to the hosting
 * compute. SageMaker publishes endpoint, feature-group, model-package, and
 * job lifecycle transitions to the account's default EventBridge bus
 * (source `aws.sagemaker`); this subscribes the host Function to those
 * events so it can react — e.g. alert when an endpoint drops out of
 * `InService` or kick off downstream work when a training job completes.
 *
 * SageMaker publishes to EventBridge automatically — no additional resource
 * is created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on the
 * Function effect.
 *
 * ### Consuming SageMaker Events
 * **Example:** Alert When an Endpoint Fails
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.SageMaker.consumeSageMakerEvents(
 *       { kinds: ["endpoint"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           event.detail.EndpointStatus === "FAILED"
 *             ? Effect.logError(
 *                 `endpoint ${event.detail.EndpointName} failed: ${event.detail.FailureReason}`,
 *               )
 *             : Effect.void,
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeSageMakerEvents = (props, process) => consumeBusEvents(props.id ?? "SageMakerEvents", {
    source: ["aws.sagemaker"],
    "detail-type": (props.kinds ?? ["endpoint"]).map((kind) => DETAIL_TYPES[kind]),
    ...(props.resourceArns !== undefined
        ? { resources: [...props.resourceArns] }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=EventSource.js.map