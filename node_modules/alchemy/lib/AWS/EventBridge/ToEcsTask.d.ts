import * as Effect from "effect/Effect";
import type { Cluster } from "../ECS/Cluster.ts";
import type { EventBus } from "./EventBus.ts";
import { Rule, type RuleProps, type RuleTarget } from "./Rule.ts";
interface EventDescriptor {
    id?: string;
    bus?: EventBus;
    pattern: Record<string, any>;
    props?: Pick<RuleProps, "description" | "state">;
}
export interface EcsRouteTargetProps extends Pick<RuleTarget, "Input" | "InputPath" | "InputTransformer" | "RetryPolicy" | "DeadLetterConfig"> {
    task: {
        taskDefinitionArn: string;
        taskRoleArn: string;
        executionRoleArn: string;
    };
    subnets: string[];
    securityGroups?: string[];
    assignPublicIp?: boolean;
    taskCount?: number;
}
/**
 * Routes matching events from an EventBridge bus to an ECS task run.
 *
 * Creates a {@link Rule} targeting the ECS cluster plus an IAM role that lets
 * EventBridge call `ecs:RunTask` with the given task definition (Fargate
 * launch type). Usually reached through the `events(...)` builder rather than
 * called directly.
 * **Example:** Run a Fargate Task for Matching Events
 * ```typescript
 * yield* AWS.EventBridge.events(bus, { source: ["my.app"] }).toEcsTask(cluster, {
 *   task: {
 *     taskDefinitionArn: yield* taskDefinition.taskDefinitionArn,
 *     taskRoleArn: yield* taskRole.roleArn,
 *     executionRoleArn: yield* executionRole.roleArn,
 *   },
 *   subnets: subnetIds,
 *   assignPublicIp: true,
 * });
 * ```
 *
 * @binding
 */
export declare const toEcsTask: (descriptor: EventDescriptor, cluster: Cluster, props: EcsRouteTargetProps) => Effect.Effect<Rule, never, import("../Providers.ts").Providers>;
export {};
//# sourceMappingURL=ToEcsTask.d.ts.map