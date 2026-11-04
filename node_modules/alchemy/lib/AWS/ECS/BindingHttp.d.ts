import * as Effect from "effect/Effect";
import type { Cluster } from "./Cluster.ts";
import type { Service } from "./Service.ts";
import { type Task } from "./Task.ts";
/** IAM resource scopes for cluster-bound ECS operations. */
export type EcsClusterIamResource = "cluster" | "task" | "service" | "container-instance";
/**
 * Build the impl Effect for a cluster-addressed operation whose request
 * carries a `cluster` field: the runtime callable injects the bound
 * {@link Cluster}'s ARN and the deploy-time half grants `actions` on the
 * requested `resources` scopes (or on `*` conditioned on the bound cluster
 * when `resources` is `"cluster-condition"` — for list actions that have no
 * usable resource type on Fargate).
 */
export declare const makeEcsClusterHttpBinding: <I extends {
    cluster?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.ECS.DescribeServices`. */
    tag: string;
    /** The distilled operation; `cluster` is injected from the bound cluster. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted. */
    actions: readonly string[];
    /** IAM resource scopes derived from the cluster ARN. */
    resources: readonly EcsClusterIamResource[] | "cluster-condition";
}) => Effect.Effect<(cluster: Cluster) => Effect.Effect<(request: Omit<I, "cluster">) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a task-launch operation (`RunTask`/`StartTask`):
 * the runtime callable injects the bound {@link Cluster}'s ARN as `cluster`
 * and the bound {@link Task}'s definition family (revision-less ARN) as
 * `taskDefinition`; the deploy-time half grants `actions` on every revision
 * of the task definition plus `iam:PassRole` on the task and execution
 * roles.
 */
export declare const makeEcsTaskLaunchHttpBinding: <I extends {
    cluster?: string;
    taskDefinition: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.ECS.RunTask`. */
    tag: string;
    /** The distilled operation; `cluster` + `taskDefinition` are injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the task definition ARN. */
    actions: readonly string[];
}) => Effect.Effect<(cluster: Cluster, task: Task) => Effect.Effect<(request: Omit<I, "cluster" | "taskDefinition">) => Effect.Effect<A, E, never>, never, never>, never, R>;
/** IAM resource scopes for service-bound ECS operations. */
export type EcsServiceIamResource = "service" | "service-deployment" | "service-revision";
/**
 * Build the impl Effect for a service-addressed operation (deployment
 * observation and blue/green lifecycle-hook control). The deploy-time half
 * grants `actions` on the requested scopes derived from the bound
 * {@link Service}'s ARN. When `inject` is set, the runtime callable injects
 * the service ARN as `service` and the cluster ARN as `cluster`; otherwise
 * the request passes through as-is (deployment/revision ARNs are only known
 * at runtime).
 */
export declare const makeEcsServiceHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.ECS.StopServiceDeployment`. */
    tag: string;
    /** The distilled operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted. */
    actions: readonly string[];
    /** IAM resource scopes derived from the service ARN. */
    resources: readonly EcsServiceIamResource[];
    /** Inject `service` (service ARN) + `cluster` (cluster ARN) into requests. */
    inject?: boolean;
}) => Effect.Effect<(service: Service) => Effect.Effect<(request: Omit<I, "cluster" | "service">) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map