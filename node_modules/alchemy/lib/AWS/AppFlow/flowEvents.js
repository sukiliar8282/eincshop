/**
 * Builds an EventBridge event pattern for Amazon AppFlow flow run reports,
 * for use with the EventBridge event source / routing helpers. AppFlow
 * publishes start/end run reports to the default event bus (`source:
 * "aws.appflow"`); the event detail carries `flow-name`, `execution-id`,
 * `status`, timing, and record counts.
 *
 * @example Consume end-of-run reports for a flow with a Lambda handler
 * ```typescript
 * yield* AWS.EventBridge.consumeBusEvents(
 *   AWS.AppFlow.flowEvents({
 *     flowNames: ["my-flow"],
 *     detailTypes: ["AppFlow End Flow Run Report"],
 *   }),
 *   (events) =>
 *     events.pipe(
 *       Stream.runForEach((event) => Effect.log(event.detail)),
 *     ),
 * );
 * ```
 *
 * @example Route failed runs to an SQS queue
 * ```typescript
 * yield* AWS.EventBridge.events(
 *   AWS.AppFlow.flowEvents({ statuses: ["Execution Failed"] }),
 * ).toQueue(alerts);
 * ```
 */
export const flowEvents = ({ flowNames, detailTypes, statuses, } = {}) => ({
    source: ["aws.appflow"],
    ...(detailTypes ? { "detail-type": detailTypes } : {}),
    ...(flowNames || statuses
        ? {
            detail: {
                ...(flowNames ? { "flow-name": flowNames } : {}),
                ...(statuses ? { status: statuses } : {}),
            },
        }
        : {}),
});
//# sourceMappingURL=flowEvents.js.map