import * as Effect from "effect/Effect";
import { createHash } from "node:crypto";
import * as Binding from "../../Binding.js";
import * as IAM from "../IAM/index.js";
import { Schedule } from "./Schedule.js";
/**
 * Narrow an arbitrary Lambda invocation payload to a schedule event produced
 * by `consumeSchedule`.
 */
export const isScheduleEvent = (event) => event?.source === "alchemy.scheduler" &&
    typeof event?.scheduleId === "string";
export const ScheduleEventSource = Binding.Service("AWS.Scheduler.ScheduleEventSource");
export function consumeSchedule(...args) {
    const process = args[args.length - 1];
    const head = args.slice(0, -1);
    const id = typeof head[0] === "string" ? head[0] : undefined;
    const builder = (id === undefined ? head[0] : head[1]);
    return ScheduleEventSource.use((source) => source(toScheduleDescriptor(id, builder.state), process));
}
const toScheduleDescriptor = (id, state) => ({
    id: id ?? state.name,
    expression: state.expression,
    props: {
        group: state.group,
        description: state.description,
        state: state.state,
        timezone: state.timezone,
        startDate: state.startDate,
        endDate: state.endDate,
        kmsKeyArn: state.kmsKeyArn,
        flexibleTimeWindow: state.flexibleTimeWindow,
        actionAfterCompletion: state.actionAfterCompletion,
    },
});
/**
 * Derive the stable route id for a schedule descriptor: the explicit id when
 * given, otherwise a hash of the expression and the host Function's logical
 * id. Computed identically at deploy time (to name the backing resources) and
 * at runtime (to match incoming events to the handler).
 */
export const createScheduleRouteId = (descriptor, fn) => descriptor.id ??
    `Scheduler${createHash("sha1")
        .update(JSON.stringify({
        expression: descriptor.expression,
        host: fn.LogicalId,
    }))
        .digest("hex")
        .slice(0, 10)}`;
/**
 * Deploy-time half of `consumeSchedule`: synthesize the execution role that
 * lets EventBridge Scheduler invoke the host Function and create the backing
 * `Schedule` whose `Input` template carries the typed event envelope.
 *
 * @binding
 */
export const createScheduleRoute = (routeId, descriptor, fn) => Effect.gen(function* () {
    const props = descriptor.props ?? {};
    const role = yield* IAM.Role(`${routeId}Role`, {
        assumeRolePolicyDocument: {
            Version: "2012-10-17",
            Statement: [
                {
                    Effect: "Allow",
                    Principal: { Service: "scheduler.amazonaws.com" },
                    Action: ["sts:AssumeRole"],
                },
            ],
        },
        inlinePolicies: {
            InvokeHost: {
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Action: ["lambda:InvokeFunction"],
                        Resource: [fn.functionArn],
                    },
                ],
            },
        },
    });
    return yield* Schedule(routeId, {
        groupName: props.group?.scheduleGroupName,
        scheduleExpression: descriptor.expression,
        description: props.description,
        scheduleExpressionTimezone: props.timezone,
        startDate: props.startDate,
        endDate: props.endDate,
        state: props.state,
        kmsKeyArn: props.kmsKeyArn,
        flexibleTimeWindow: props.flexibleTimeWindow ?? { Mode: "OFF" },
        actionAfterCompletion: props.actionAfterCompletion,
        target: {
            Arn: fn.functionArn,
            RoleArn: role.roleArn,
            // EventBridge Scheduler substitutes the <aws.scheduler.*> context
            // attributes into this template at invocation time; the resulting
            // JSON is the Lambda event payload matched by `isScheduleEvent`.
            Input: JSON.stringify({
                source: "alchemy.scheduler",
                scheduleId: routeId,
                scheduleArn: "<aws.scheduler.schedule-arn>",
                scheduledTime: "<aws.scheduler.scheduled-time>",
                executionId: "<aws.scheduler.execution-id>",
                attemptNumber: "<aws.scheduler.attempt-number>",
            }),
            RetryPolicy: props.retryPolicy,
            DeadLetterConfig: props.deadLetterConfig,
        },
    });
});
//# sourceMappingURL=ScheduleEventSource.js.map