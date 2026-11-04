import * as Scheduler from "../Scheduler/index.js";
const toScheduleExpression = (value) => value.startsWith("rate(") || value.startsWith("cron(")
    ? value
    : `rate(${value})`;
/**
 * Creates a scheduled EventBridge rule that runs an ECS Fargate task.
 *
 * `every` is the high-level ECS scheduling helper for phase 1. It provisions
 * the EventBridge rule plus the invoke role required to call `ecs:RunTask` and
 * `iam:PassRole` for the target task's execution roles.
 *
 * Plain English durations like `"1 hour"` are normalized to `rate(...)`
 * expressions automatically. Full `rate(...)` and `cron(...)` expressions are
 * also accepted as-is.
 * **Example:** Run a task every hour
 * ```typescript
 * yield* AWS.ECS.every("HourlyJob", "1 hour", {
 *   cluster,
 *   task: jobTask,
 *   subnets: [privateSubnet1.subnetId, privateSubnet2.subnetId],
 *   securityGroups: [jobSecurityGroup.groupId],
 * });
 * ```
 *
 * **Example:** Use an explicit cron expression
 * ```typescript
 * yield* AWS.ECS.every("NightlyJob", "cron(0 3 * * ? *)", {
 *   cluster,
 *   task: nightlyTask,
 *   subnets: [privateSubnet1.subnetId, privateSubnet2.subnetId],
 *   securityGroups: [jobSecurityGroup.groupId],
 * });
 * ```
 *
 * **Example:** Run multiple copies with static input
 * ```typescript
 * yield* AWS.ECS.every("BatchJob", "30 minutes", {
 *   cluster,
 *   task: batchTask,
 *   subnets: [privateSubnet1.subnetId, privateSubnet2.subnetId],
 *   securityGroups: [jobSecurityGroup.groupId],
 *   taskCount: 3,
 *   input: JSON.stringify({ source: "scheduler" }),
 * });
 * ```
 *
 * @binding
 */
export const every = (id, schedule, props) => Scheduler.every(toScheduleExpression(schedule)).named(id).toEcsTask({
    cluster: props.cluster,
    task: props.task,
    subnets: props.subnets,
    securityGroups: props.securityGroups,
    assignPublicIp: props.assignPublicIp,
    taskCount: props.taskCount,
    input: props.input,
});
//# sourceMappingURL=Schedule.js.map