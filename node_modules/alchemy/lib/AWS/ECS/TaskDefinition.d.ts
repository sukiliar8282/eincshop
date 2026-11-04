import * as ecs from "@distilled.cloud/aws/ecs";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * Reference to an IAM role: a raw role ARN or anything exposing a `roleArn`
 * attribute (e.g. an `AWS.IAM.Role` resource).
 */
export type RoleRef = string | {
    roleArn: string;
};
export interface TaskDefinitionProps {
    /**
     * Task definition family. All revisions registered by this resource share
     * this family. If omitted, a unique family is generated.
     *
     * Changing the family replaces the resource.
     */
    family?: string;
    /**
     * Container definitions for the task (bring-your-own images: ECR
     * repository URIs, `public.ecr.aws/...`, Docker Hub, etc.).
     *
     * The first container is treated as the primary container: its `name` and
     * first `portMappings[].containerPort` are surfaced as the `containerName`
     * and `port` attributes so the task definition can be wired directly into
     * `AWS.ECS.Service`'s `task` prop.
     */
    containerDefinitions: ecs.ContainerDefinition[];
    /**
     * Task-level CPU units. Required by Fargate.
     * @default 256 when `requiresCompatibilities` includes `FARGATE`
     */
    cpu?: number | string;
    /**
     * Task-level memory (MiB). Required by Fargate.
     * @default 512 when `requiresCompatibilities` includes `FARGATE`
     */
    memory?: number | string;
    /**
     * IAM role assumed by the containers at runtime (application permissions).
     * Accepts a role ARN or an `AWS.IAM.Role` resource.
     */
    taskRoleArn?: RoleRef;
    /**
     * IAM role used by the ECS agent to pull images and ship logs. Accepts a
     * role ARN or an `AWS.IAM.Role` resource. Required by Fargate when private
     * registries or the `awslogs` log driver are used.
     */
    executionRoleArn?: RoleRef;
    /**
     * Docker network mode.
     * @default "awsvpc" when `requiresCompatibilities` includes `FARGATE`
     */
    networkMode?: ecs.NetworkMode;
    /**
     * Launch-type compatibilities the task definition must support
     * (`FARGATE` and/or `EC2`/`EXTERNAL`).
     * @default ["FARGATE"]
     */
    requiresCompatibilities?: ecs.Compatibility[];
    /**
     * Convenience CloudWatch Logs wiring. When set, Alchemy creates (and owns)
     * a log group and injects an `awslogs` `logConfiguration` into every
     * container definition that does not declare its own.
     *
     * `true` uses the default group name `/ecs/{family}`; pass an object to
     * override the group name or stream prefix. The log group is deleted when
     * the resource is destroyed.
     */
    awslogs?: boolean | {
        /**
         * Log group name.
         * @default `/ecs/${family}`
         */
        group?: string;
        /**
         * awslogs stream prefix.
         * @default the task family
         */
        streamPrefix?: string;
    };
    /**
     * Task-level data volumes (host / docker / EFS / FSx Windows). Containers
     * reference these via `mountPoints`.
     */
    volumes?: ecs.Volume[];
    /**
     * Task definition placement constraints (`memberOf` expressions). Only
     * applies to EC2/EXTERNAL launch types.
     */
    placementConstraints?: ecs.TaskDefinitionPlacementConstraint[];
    /**
     * CPU architecture and operating-system family the task runs on, e.g.
     * `{ cpuArchitecture: "ARM64", operatingSystemFamily: "LINUX" }`.
     */
    runtimePlatform?: ecs.RuntimePlatform;
    /**
     * Amount of ephemeral storage to allocate for the task on Fargate.
     */
    ephemeralStorage?: ecs.EphemeralStorage;
    /**
     * IPC resource namespace to use for the containers in the task.
     */
    ipcMode?: ecs.IpcMode;
    /**
     * Process namespace to use for the containers in the task.
     */
    pidMode?: ecs.PidMode;
    /**
     * App Mesh proxy configuration.
     */
    proxyConfiguration?: ecs.ProxyConfiguration;
    /**
     * Elastic Inference accelerators to attach to the task.
     */
    inferenceAccelerators?: ecs.InferenceAccelerator[];
    /**
     * Whether to enable AWS Fault Injection (FIS) actions on the task.
     * @default false
     */
    enableFaultInjection?: boolean;
    /**
     * User-defined tags applied to each registered revision.
     */
    tags?: Record<string, string>;
}
export interface TaskDefinition extends Resource<"AWS.ECS.TaskDefinition", TaskDefinitionProps, {
    /**
     * ARN of the latest revision registered by this resource.
     */
    taskDefinitionArn: string;
    /**
     * Task definition family.
     */
    family: string;
    /**
     * Revision number of {@link taskDefinitionArn}.
     */
    revision: number;
    /**
     * Name of the primary (first) container — for `AWS.ECS.Service` wiring.
     */
    containerName: string;
    /**
     * First `containerPort` of the primary container (0 when the container
     * declares no port mappings) — for `AWS.ECS.Service` wiring.
     */
    port: number;
    /**
     * Resolved task role ARN, when configured.
     */
    taskRoleArn: string | undefined;
    /**
     * Resolved execution role ARN, when configured.
     */
    executionRoleArn: string | undefined;
    /**
     * Name of the Alchemy-managed log group, when `awslogs` is enabled.
     */
    logGroupName: string | undefined;
    /**
     * ARN of the Alchemy-managed log group, when `awslogs` is enabled.
     */
    logGroupArn: string | undefined;
}, never, Providers> {
}
/**
 * A standalone ECS task definition for bring-your-own-container workloads.
 *
 * Unlike the Effect-native `AWS.ECS.Task` (which bundles an inline program and
 * builds/pushes a Docker image), `TaskDefinition` registers user-supplied
 * `containerDefinitions` — any image URI from ECR, `public.ecr.aws`, or an
 * external registry — with full control over Fargate/EC2 compatibility,
 * volumes, runtime platform, and IAM roles.
 *
 * Task definitions are immutable revisions under a family:
 *
 * - reconcile registers a **new revision only when the definition content
 *   changed** (compared against the observed latest `ACTIVE` revision), so a
 *   no-op redeploy keeps the same revision;
 * - changing the `family` replaces the resource;
 * - destroy deregisters and hard-deletes every revision of the family. ECS
 *   may retain referenced revisions in `DELETE_IN_PROGRESS` until their tasks
 *   and services terminate; that is a successful terminal state.
 *
 * **Layering — why `TaskDefinition` is deliberately *not* a Platform.** ECS
 * splits "what runs" from "how it runs": a task definition is the immutable
 * container spec, while `Task` (runs to completion) and `Service`
 * (long-running) are
 * the execution vehicles. The effectful Platform abstraction requires
 * Alchemy to own the container image and entrypoint so it can bundle the
 * inline Effect program — that is exactly what `AWS.ECS.Task` does (bundle →
 * Docker build/push → register definition → serve the program). Making
 * `TaskDefinition` *also* a Platform would duplicate `Task` while
 * contradicting this resource's purpose: user-supplied images whose
 * entrypoint Alchemy must not rewrite. So the effectful path is
 * `AWS.ECS.Task`; the bring-your-own-container path is `TaskDefinition`.
 * Both surface `taskDefinitionArn` / `containerName` / `port`, so either
 * plugs into `AWS.ECS.Service`'s `task` prop unchanged.
 * ### Creating a Task Definition
 * **Example:** Public Image on Fargate
 * ```typescript
 * const taskDef = yield* TaskDefinition("Nginx", {
 *   containerDefinitions: [
 *     {
 *       name: "nginx",
 *       image: "public.ecr.aws/nginx/nginx:stable",
 *       essential: true,
 *       portMappings: [{ containerPort: 80, protocol: "tcp" }],
 *     },
 *   ],
 * });
 * ```
 *
 * **Example:** With IAM Roles and CloudWatch Logs
 * ```typescript
 * const taskDef = yield* TaskDefinition("Api", {
 *   cpu: 512,
 *   memory: 1024,
 *   taskRoleArn: taskRole,           // AWS.IAM.Role resource or raw ARN
 *   executionRoleArn: executionRole, // needed for awslogs / private images
 *   awslogs: true,                   // creates /ecs/{family} and injects awslogs config
 *   containerDefinitions: [
 *     {
 *       name: "api",
 *       image: image.imageUri,
 *       essential: true,
 *       portMappings: [{ containerPort: 8080 }],
 *       environment: [{ name: "STAGE", value: "prod" }],
 *     },
 *   ],
 * });
 * ```
 *
 * ### Running with a Service
 * **Example:** Wire into AWS.ECS.Service
 * ```typescript
 * const service = yield* Service("ApiService", {
 *   cluster,
 *   task: taskDef, // exposes taskDefinitionArn / containerName / port
 *   vpcId: vpc.vpcId,
 *   subnets: [subnet.subnetId],
 *   assignPublicIp: true,
 * });
 * ```
 *
 * ### EC2 Launch Type
 * **Example:** EC2 Task with a Host Volume
 * ```typescript
 * const taskDef = yield* TaskDefinition("Agent", {
 *   requiresCompatibilities: ["EC2"],
 *   networkMode: "bridge",
 *   volumes: [{ name: "docker-sock", host: { sourcePath: "/var/run/docker.sock" } }],
 *   containerDefinitions: [
 *     {
 *       name: "agent",
 *       image: "public.ecr.aws/docker/library/busybox:stable",
 *       memory: 128,
 *       essential: true,
 *       mountPoints: [{ sourceVolume: "docker-sock", containerPath: "/var/run/docker.sock" }],
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const TaskDefinition: import("../../Resource.ts").ResourceClass<TaskDefinition>;
export declare const TaskDefinitionProvider: () => import("effect/Layer").Layer<Provider.Provider<TaskDefinition>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=TaskDefinition.d.ts.map