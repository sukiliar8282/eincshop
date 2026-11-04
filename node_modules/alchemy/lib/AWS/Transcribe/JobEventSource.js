import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Event source connecting Amazon Transcribe batch job completions to the
 * hosting compute. Transcribe publishes a `Transcribe Job State Change`
 * event (source `aws.transcribe`) to the account's default EventBridge bus
 * when a batch transcription job reaches `COMPLETED` or `FAILED`; this
 * subscribes the host Function to those events so it can chain
 * post-transcription processing without polling {@link GetTranscriptionJob}.
 *
 * Transcribe publishes to EventBridge automatically — no additional
 * resource is created besides the EventBridge rule targeting the host.
 * Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Job Events
 * **Example:** React To Finished Transcriptions
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default TranscriptReactor.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.Transcribe.consumeTranscriptionJobEvents(
 *       { statuses: ["COMPLETED", "FAILED"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           event.detail.TranscriptionJobStatus === "FAILED"
 *             ? Effect.log(`job ${event.detail.TranscriptionJobName} failed: ${event.detail.FailureReason}`)
 *             : Effect.log(`job ${event.detail.TranscriptionJobName} complete`),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeTranscriptionJobEvents = (props, process) => consumeBusEvents(props.id ?? "TranscribeJobEvents", {
    source: ["aws.transcribe"],
    "detail-type": ["Transcribe Job State Change"],
    ...(props.statuses
        ? { detail: { TranscriptionJobStatus: [...props.statuses] } }
        : {}),
}, { description: props.description, state: props.state }, process);
/**
 * Event source for Amazon Transcribe `Call Analytics Job State Change`
 * events (source `aws.transcribe`) — fires when a Call Analytics job
 * reaches `COMPLETED` or `FAILED`.
 *
 * ### Consuming Job Events
 * **Example:** React To Finished Call Analytics Jobs
 * ```typescript
 * yield* AWS.Transcribe.consumeCallAnalyticsJobEvents(
 *   { statuses: ["COMPLETED"] },
 *   (events) =>
 *     Stream.runForEach(events, (event) =>
 *       Effect.log(`call ${event.detail.JobName} analyzed`),
 *     ),
 * );
 * ```
 */
export const consumeCallAnalyticsJobEvents = (props, process) => consumeBusEvents(props.id ?? "TranscribeCallAnalyticsJobEvents", {
    source: ["aws.transcribe"],
    "detail-type": ["Call Analytics Job State Change"],
    ...(props.statuses ? { detail: { JobStatus: [...props.statuses] } } : {}),
}, { description: props.description, state: props.state }, process);
/**
 * Event source for AWS HealthScribe `Medical Scribe Job State Change`
 * events (source `aws.transcribe`) — fires when a Medical Scribe job
 * reaches `COMPLETED` or `FAILED`.
 *
 * ### Consuming Job Events
 * **Example:** React To Finished Medical Scribe Jobs
 * ```typescript
 * yield* AWS.Transcribe.consumeMedicalScribeJobEvents(
 *   { statuses: ["COMPLETED"] },
 *   (events) =>
 *     Stream.runForEach(events, (event) =>
 *       Effect.log(`visit ${event.detail.MedicalScribeJobName} summarized`),
 *     ),
 * );
 * ```
 */
export const consumeMedicalScribeJobEvents = (props, process) => consumeBusEvents(props.id ?? "TranscribeMedicalScribeJobEvents", {
    source: ["aws.transcribe"],
    "detail-type": ["Medical Scribe Job State Change"],
    ...(props.statuses
        ? { detail: { MedicalScribeJobStatus: [...props.statuses] } }
        : {}),
}, { description: props.description, state: props.state }, process);
/**
 * Event source for Amazon Transcribe `Vocabulary State Change` events
 * (source `aws.transcribe`) — fires when custom vocabulary processing
 * reaches `READY` or `FAILED`, so runtime-created vocabularies (e.g.
 * per-tenant via {@link CreateVocabulary}) can be used the moment they are
 * ready.
 *
 * ### Consuming Job Events
 * **Example:** React To Ready Vocabularies
 * ```typescript
 * yield* AWS.Transcribe.consumeVocabularyEvents(
 *   { states: ["READY"] },
 *   (events) =>
 *     Stream.runForEach(events, (event) =>
 *       Effect.log(`vocabulary ${event.detail.VocabularyName} ready`),
 *     ),
 * );
 * ```
 */
export const consumeVocabularyEvents = (props, process) => consumeBusEvents(props.id ?? "TranscribeVocabularyEvents", {
    source: ["aws.transcribe"],
    "detail-type": ["Vocabulary State Change"],
    ...(props.states
        ? { detail: { VocabularyState: [...props.states] } }
        : {}),
}, { description: props.description, state: props.state }, process);
/**
 * Event source for Amazon Transcribe `Language Model State Change` events
 * (source `aws.transcribe`) — fires when custom language model training
 * (started with {@link CreateLanguageModel}) reaches `COMPLETED` or
 * `FAILED`.
 *
 * ### Consuming Job Events
 * **Example:** React To Trained Language Models
 * ```typescript
 * yield* AWS.Transcribe.consumeLanguageModelEvents(
 *   { statuses: ["COMPLETED"] },
 *   (events) =>
 *     Stream.runForEach(events, (event) =>
 *       Effect.log(`model ${event.detail.ModelName} trained`),
 *     ),
 * );
 * ```
 */
export const consumeLanguageModelEvents = (props, process) => consumeBusEvents(props.id ?? "TranscribeLanguageModelEvents", {
    source: ["aws.transcribe"],
    "detail-type": ["Language Model State Change"],
    ...(props.statuses
        ? { detail: { ModelStatus: [...props.statuses] } }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=JobEventSource.js.map