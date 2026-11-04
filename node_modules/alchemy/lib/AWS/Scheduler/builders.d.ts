import type * as scheduler from "@distilled.cloud/aws/scheduler";
import * as Effect from "effect/Effect";
import type { Input } from "../../Input.ts";
import type { Cluster } from "../ECS/Cluster.ts";
import type { Function } from "../Lambda/Function.ts";
import type { Queue } from "../SQS/Queue.ts";
import { Schedule } from "./Schedule.ts";
import type { ScheduleGroup } from "./ScheduleGroup.ts";
/**
 * Accumulated state of a fluent schedule builder (`every`/`cron`/`at` plus
 * any `.named(...)` and target options applied so far).
 */
export interface ScheduleBuilderState {
    /** Schedule expression: `rate(...)`, `cron(...)`, or `at(...)`. */
    expression: string;
    /** Explicit schedule name set via `.named(...)`. */
    name?: string;
    /** Schedule group the schedule is created in. */
    group?: ScheduleGroup;
    /** Description on the backing schedule. */
    description?: string;
    /** Timezone for cron or at expressions. */
    timezone?: string;
    /** Date before which the schedule does not fire. */
    startDate?: Date;
    /** Date after which the schedule stops firing. */
    endDate?: Date;
    /** Desired schedule state (`ENABLED` / `DISABLED`). */
    state?: string;
    /** KMS key ARN used to encrypt the schedule's target input. */
    kmsKeyArn?: string;
    /**
     * Flexible time window configuration.
     * @default { Mode: "OFF" }
     */
    flexibleTimeWindow?: scheduler.FlexibleTimeWindow;
    /** Action after a one-time schedule completes (e.g. `DELETE`). */
    actionAfterCompletion?: string;
}
/**
 * Options accepted by the `every`/`cron`/`at` schedule builders.
 */
export interface ScheduleOptions {
    /** Schedule group the schedule is created in. */
    group?: ScheduleGroup;
    /** Description on the backing schedule. */
    description?: string;
    /** Timezone for cron or at expressions. */
    timezone?: string;
    /** Date before which the schedule does not fire. */
    startDate?: Date;
    /** Date after which the schedule stops firing. */
    endDate?: Date;
    /** Desired schedule state (`ENABLED` / `DISABLED`). */
    state?: string;
    /** KMS key ARN used to encrypt the schedule's target input. */
    kmsKeyArn?: string;
    /**
     * Flexible time window configuration.
     * @default { Mode: "OFF" }
     */
    flexibleTimeWindow?: scheduler.FlexibleTimeWindow;
    /** Action after a one-time schedule completes (e.g. `DELETE`). */
    actionAfterCompletion?: string;
}
/**
 * Target options for `.toLambda(fn, props)`.
 */
export interface LambdaTargetProps {
    /** JSON-serializable payload passed to the function as the event. */
    input?: unknown;
    /** Retry policy for failed invocations. */
    retryPolicy?: scheduler.RetryPolicy;
    /** Dead-letter queue for undeliverable invocations. */
    deadLetterConfig?: scheduler.DeadLetterConfig;
}
/**
 * Target options for `.toQueue(queue, payload, props)` — note the message
 * payload is passed as `.toQueue`'s second argument, not via `input`.
 */
export interface QueueTargetProps {
    /** JSON-serializable payload used as the message body. */
    input?: unknown;
    /** Retry policy for failed deliveries. */
    retryPolicy?: scheduler.RetryPolicy;
    /** Dead-letter queue for undeliverable deliveries. */
    deadLetterConfig?: scheduler.DeadLetterConfig;
    /** SQS-specific parameters (e.g. `MessageGroupId` for FIFO queues). */
    sqs?: scheduler.SqsParameters;
}
/**
 * Target options for `.toEcsTask(props)`.
 */
export interface EcsTaskTargetProps {
    /** ECS cluster the task runs on. */
    cluster: Cluster;
    /**
     * Task definition and the roles Scheduler passes to it.
     *
     * This is a builder argument (not resource Props), so the fields are
     * `Input`-typed explicitly: an `AWS.ECS.Task` resource — whose attributes
     * are `Output`s — is directly assignable here.
     */
    task: {
        /** ARN of the task definition to run. */
        taskDefinitionArn: Input<string>;
        /** ARN of the task role (`iam:PassRole` is granted automatically). */
        taskRoleArn: Input<string>;
        /** ARN of the execution role (`iam:PassRole` is granted automatically). */
        executionRoleArn: Input<string>;
    };
    /** Subnets for the task's awsvpc network configuration. */
    subnets: Input<string[]>;
    /** Security groups for the task's awsvpc network configuration. */
    securityGroups?: Input<string[]>;
    /**
     * Whether the task gets a public IP.
     * @default false
     */
    assignPublicIp?: boolean;
    /**
     * Number of tasks to launch per invocation.
     * @default 1
     */
    taskCount?: number;
    /** JSON-serializable payload passed to the task as the event. */
    input?: unknown;
    /** Retry policy for failed task launches. */
    retryPolicy?: scheduler.RetryPolicy;
    /** Dead-letter queue for undeliverable invocations. */
    deadLetterConfig?: scheduler.DeadLetterConfig;
}
export declare const every: (value: string, options?: ScheduleOptions) => {
    /**
     * The accumulated builder state (expression, name, group, ...). Read by
     * `consumeSchedule` to materialize the schedule against the host Function.
     */
    state: ScheduleBuilderState;
    named: (name: string) => /*elided*/ any;
    toLambda: (fn: Function, props?: LambdaTargetProps) => Effect.Effect<Schedule, never, import("../Providers.ts").Providers>;
    toQueue: (queue: Queue, payload?: unknown, props?: Omit<QueueTargetProps, "input">) => Effect.Effect<Schedule, never, import("../Providers.ts").Providers>;
    toEcsTask: (props: EcsTaskTargetProps) => Effect.Effect<Schedule, never, import("../Providers.ts").Providers>;
};
export declare const cron: (expression: string, options?: ScheduleOptions) => {
    /**
     * The accumulated builder state (expression, name, group, ...). Read by
     * `consumeSchedule` to materialize the schedule against the host Function.
     */
    state: ScheduleBuilderState;
    named: (name: string) => /*elided*/ any;
    toLambda: (fn: Function, props?: LambdaTargetProps) => Effect.Effect<Schedule, never, import("../Providers.ts").Providers>;
    toQueue: (queue: Queue, payload?: unknown, props?: Omit<QueueTargetProps, "input">) => Effect.Effect<Schedule, never, import("../Providers.ts").Providers>;
    toEcsTask: (props: EcsTaskTargetProps) => Effect.Effect<Schedule, never, import("../Providers.ts").Providers>;
};
export declare const at: (date: Date, options?: ScheduleOptions) => {
    /**
     * The accumulated builder state (expression, name, group, ...). Read by
     * `consumeSchedule` to materialize the schedule against the host Function.
     */
    state: ScheduleBuilderState;
    named: (name: string) => /*elided*/ any;
    toLambda: (fn: Function, props?: LambdaTargetProps) => Effect.Effect<Schedule, never, import("../Providers.ts").Providers>;
    toQueue: (queue: Queue, payload?: unknown, props?: Omit<QueueTargetProps, "input">) => Effect.Effect<Schedule, never, import("../Providers.ts").Providers>;
    toEcsTask: (props: EcsTaskTargetProps) => Effect.Effect<Schedule, never, import("../Providers.ts").Providers>;
};
/**
 * The fluent schedule builder returned by `every`/`cron`/`at`. Route it to a
 * target with `.toLambda`/`.toQueue`/`.toEcsTask`, or consume it on the host
 * Function with `consumeSchedule(builder, handler)`.
 */
export type ScheduleBuilder = ReturnType<typeof makeBuilder>;
declare const makeBuilder: (state: ScheduleBuilderState) => {
    /**
     * The accumulated builder state (expression, name, group, ...). Read by
     * `consumeSchedule` to materialize the schedule against the host Function.
     */
    state: ScheduleBuilderState;
    named: (name: string) => /*elided*/ any;
    toLambda: (fn: Function, props?: LambdaTargetProps) => Effect.Effect<Schedule, never, import("../Providers.ts").Providers>;
    toQueue: (queue: Queue, payload?: unknown, props?: Omit<QueueTargetProps, "input">) => Effect.Effect<Schedule, never, import("../Providers.ts").Providers>;
    toEcsTask: (props: EcsTaskTargetProps) => Effect.Effect<Schedule, never, import("../Providers.ts").Providers>;
};
export {};
//# sourceMappingURL=builders.d.ts.map