import * as logs from "@distilled.cloud/aws/cloudwatch-logs";
import * as ecr from "@distilled.cloud/aws/ecr";
import * as ecs from "@distilled.cloud/aws/ecs";
import * as iam from "@distilled.cloud/aws/iam";
import { Region } from "@distilled.cloud/aws/Region";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import { Platform, } from "../../Platform.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createContainerRuntimeContext, } from "../../Server/Process.js";
import { Stack } from "../../Stack.js";
import { createInternalTags, createTagsList, diffTags, hasTags, } from "../../Tags.js";
import { makeBunBootstrap, makeImageSource, } from "../ECR/ImageSource.js";
import { AWSEnvironment } from "../Environment.js";
export const isTask = (value) => {
    return (typeof value === "object" &&
        value !== null &&
        "Type" in value &&
        value.Type === "AWS.ECS.Task");
};
export class TaskEnvironment extends Context.Service()("AWS.ECS.TaskEnvironment") {
}
// Shared with `Docker.Service`; lives beside the host runtime context.
export { createContainerRuntimeContext } from "../../Server/Process.js";
/**
 * A Fargate task definition with a container image from one of three
 * sources, declared flat on the props:
 *
 * - `main` — bundle an inline Effect program into a generated image
 *   (compose with `image` or an inline `dockerfile` to pick the
 *   environment; defaults to `oven/bun:1`).
 * - `context` — build your own Dockerfile (`dockerfile` is a path relative
 *   to the cwd, defaulting to `${context}/Dockerfile`).
 * - `image` — run a pre-built registry image, mirrored into ECR.
 *
 * `Task` provisions task + execution IAM roles, a CloudWatch log group, and
 * an ECR repository holding the built (or mirrored) image, then registers a
 * Fargate task definition. Each reconcile registers a new immutable
 * revision. A launched task runs until its process exits — it is the target
 * of `AWS.ECS.RunTask` / `StopTask` bindings and `AWS.ECS.Schedule`;
 * effectful impls return `{ run }`, executed to completion when the
 * container starts.
 *
 * Beyond the primary container you can declare task-level configuration
 * (volumes, runtime platform, ephemeral storage, IPC/PID mode, placement
 * constraints) and append additional `sidecars` for multi-container tasks.
 * ### Creating a Task
 * **Example:** Remote Image
 * ```typescript
 * const migrate = yield* Task("DbMigrate", {
 *   image: "public.ecr.aws/docker/library/busybox:stable",
 *   command: ["sh", "-c", "echo done"],
 *   cpu: 256,
 *   memory: 512,
 * });
 * ```
 *
 * **Example:** Build Your Own Dockerfile
 * ```typescript
 * const render = yield* Task("RenderJob", {
 *   context: "./render",                    // dockerfile defaults to ./render/Dockerfile
 *   dockerfile: "./render/Dockerfile.gpu",  // always a PATH
 *   cpu: 1024,
 *   memory: 4096,
 * });
 * ```
 *
 * **Example:** Inline Effect Program
 * ```typescript
 * const drainer = yield* Task(
 *   "QueueDrainer",
 *   { main: import.meta.url, image: "oven/bun:1", cpu: 256, memory: 512 },
 *   Effect.gen(function* () {
 *     const receive = yield* AWS.SQS.ReceiveMessage(queue);
 *     return {
 *       run: Effect.gen(function* () {
 *         // runs to completion, then the container exits
 *         const batch = yield* receive({ MaxNumberOfMessages: 10 });
 *       }),
 *     };
 *   }),
 * );
 * ```
 *
 * ### Multi-Container Tasks
 * **Example:** Task with a Sidecar
 * ```typescript
 * const task = yield* Task("ApiTask", {
 *   main: import.meta.url,
 *   port: 3000,
 *   sidecars: [
 *     {
 *       name: "otel-collector",
 *       image: "public.ecr.aws/aws-observability/aws-otel-collector:latest",
 *       essential: false,
 *       portMappings: [{ containerPort: 4317, protocol: "tcp" }],
 *     },
 *   ],
 * });
 * ```
 *
 * ### Bundling & Tree-shaking
 * `main` is bundled with rolldown at deploy time. Unused code is
 * tree-shaken. `effect`, alchemy, and `@distilled.cloud` are marked
 * pure so unused parts prune more aggressively. Your app is not
 * marked pure.
 *
 * **Example:** Mark additional packages as pure
 * Only list packages with no top-level side effects.
 * ```typescript
 * {
 *   main: import.meta.url,
 *   build: {
 *     pure: { packages: ["my-lib", "@my-scope/*"] },
 *   },
 * }
 * ```
 *
 * **Example:** Turn it off
 * ```typescript
 * {
 *   main: import.meta.url,
 *   build: { pure: false },
 * }
 * ```
 *
 * ### Task-Level Configuration
 * **Example:** ARM64 with EFS Volume and Ephemeral Storage
 * ```typescript
 * const task = yield* Task("WorkerTask", {
 *   main: import.meta.url,
 *   runtimePlatform: { cpuArchitecture: "ARM64", operatingSystemFamily: "LINUX" },
 *   ephemeralStorage: { sizeInGiB: 40 },
 *   volumes: [
 *     {
 *       name: "data",
 *       efsVolumeConfiguration: { fileSystemId: fileSystem.fileSystemId },
 *     },
 *   ],
 *   container: {
 *     mountPoints: [{ sourceVolume: "data", containerPath: "/data" }],
 *   },
 * });
 * ```
 *
 * **Example:** Environment Files from S3
 * ```typescript
 * const task = yield* Task("ApiTask", {
 *   main: import.meta.url,
 *   environmentFiles: [
 *     { value: "arn:aws:s3:::my-config-bucket/app.env", type: "s3" },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export const Task = Platform("AWS.ECS.Task", {
    createRuntimeContext: createContainerRuntimeContext("AWS.ECS.Task"),
});
/** Docker build platform matching the task definition's declared runtime. */
export const taskImagePlatform = (runtimePlatform) => 
// Build for the architecture the task definition declares (Fargate
// defaults to X86_64 when `runtimePlatform` is unset). Without this, an
// image built on an ARM64 host (e.g. Apple Silicon) is rejected at task
// start with `image Manifest does not contain descriptor matching
// platform 'linux/amd64'`.
runtimePlatform?.cpuArchitecture === "ARM64" ? "linux/arm64" : "linux/amd64";
/**
 * Create the IAM role assumed by ECS tasks if it doesn't already exist.
 * Idempotent: an `EntityAlreadyExistsException` adopts the existing role
 * only when it carries our internal tags.
 */
export const createTaskRoleIfNotExists = Effect.fn(function* ({ id, roleName, }) {
    const tags = yield* createInternalTags(id);
    const role = yield* iam
        .createRole({
        RoleName: roleName,
        AssumeRolePolicyDocument: JSON.stringify({
            Version: "2012-10-17",
            Statement: [
                {
                    Effect: "Allow",
                    Principal: {
                        Service: "ecs-tasks.amazonaws.com",
                    },
                    Action: "sts:AssumeRole",
                },
            ],
        }),
        Tags: createTagsList(tags),
    })
        .pipe(Effect.catchTag("EntityAlreadyExistsException", () => iam.getRole({ RoleName: roleName }).pipe(Effect.filterOrFail((existing) => hasTags(tags, existing.Role?.Tags), () => new Error(`Role '${roleName}' already exists and is not managed by alchemy`)))));
    return role.Role.Arn;
});
/**
 * Ensure the ECS execution role exists with the standard execution policy
 * (plus any additional managed policies) attached.
 */
export const ensureTaskExecutionRole = Effect.fn(function* ({ id, roleName, managedPolicyArns, }) {
    const roleArn = yield* createTaskRoleIfNotExists({ id, roleName });
    const policies = [
        "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
        ...(managedPolicyArns ?? []),
    ];
    for (const policyArn of policies) {
        yield* iam
            .attachRolePolicy({
            RoleName: roleName,
            PolicyArn: policyArn,
        })
            .pipe(Effect.catchTag("LimitExceededException", () => Effect.void));
    }
    return roleArn;
});
/** Inline policy granting the execution role read access to `environmentFiles`. */
const ENVIRONMENT_FILES_POLICY_NAME = "alchemy-environment-files";
/**
 * Sync the execution role's read access to the S3 `environmentFiles`: put
 * an inline policy granting `s3:GetObject` on the referenced objects (and
 * `s3:GetBucketLocation` on their buckets), or delete the policy when no
 * environment files are configured.
 */
export const syncEnvironmentFilesPolicy = Effect.fn(function* ({ roleName, environmentFiles, }) {
    const objectArns = (environmentFiles ?? [])
        .filter((file) => file.type === "s3")
        .map((file) => file.value);
    if (objectArns.length === 0) {
        yield* iam
            .deleteRolePolicy({
            RoleName: roleName,
            PolicyName: ENVIRONMENT_FILES_POLICY_NAME,
        })
            .pipe(Effect.catchTag("NoSuchEntityException", () => Effect.void));
        return;
    }
    const bucketArns = [...new Set(objectArns.map((arn) => arn.split("/")[0]))];
    yield* iam.putRolePolicy({
        RoleName: roleName,
        PolicyName: ENVIRONMENT_FILES_POLICY_NAME,
        PolicyDocument: JSON.stringify({
            Version: "2012-10-17",
            Statement: [
                {
                    Effect: "Allow",
                    Action: ["s3:GetObject"],
                    Resource: objectArns,
                },
                {
                    Effect: "Allow",
                    Action: ["s3:GetBucketLocation"],
                    Resource: bucketArns,
                },
            ],
        }),
    });
});
/** Ensure the CloudWatch log group the task writes to exists. */
export const ensureTaskLogGroup = Effect.fn(function* ({ id, logGroupName, }) {
    const { accountId, region } = yield* AWSEnvironment.current;
    const tags = yield* createInternalTags(id);
    yield* logs
        .createLogGroup({
        logGroupName,
        tags,
    })
        .pipe(Effect.catchTag("ResourceAlreadyExistsException", () => Effect.void));
    return `arn:aws:logs:${region}:${accountId}:log-group:${logGroupName}`;
});
/**
 * Apply the binding channel to the task role: collect env vars, put (or
 * clear) the inline policy from bound policy statements, and dedupe
 * binding-requested volumes/mount points.
 */
export const attachTaskBindings = Effect.fn(function* ({ roleName, policyName, bindings, }) {
    const activeBindings = bindings.filter((binding) => binding.action !== "delete");
    const env = activeBindings
        .map((binding) => binding?.data?.env)
        .reduce((acc, value) => ({ ...acc, ...value }), {});
    const policyStatements = activeBindings.flatMap((binding) => binding?.data?.policyStatements?.map((statement) => ({
        ...statement,
        Sid: statement.Sid?.replace(/[^A-Za-z0-9]+/gi, ""),
    })) ?? []);
    // Volumes/mount points requested through the binding channel (e.g.
    // `EFS.Mount`) — deduped by volume name / container path; merged
    // with the `volumes` prop and primary container in `reconcile`.
    const volumes = [
        ...new Map(activeBindings
            .flatMap((binding) => binding?.data?.volumes ?? [])
            .map((volume) => [volume.name, volume])).values(),
    ];
    const mountPoints = [
        ...new Map(activeBindings
            .flatMap((binding) => binding?.data?.mountPoints ?? [])
            .map((point) => [point.containerPath, point])).values(),
    ];
    if (policyStatements.length > 0) {
        yield* iam.putRolePolicy({
            RoleName: roleName,
            PolicyName: policyName,
            PolicyDocument: JSON.stringify({
                Version: "2012-10-17",
                Statement: policyStatements,
            }),
        });
    }
    else {
        yield* iam
            .deleteRolePolicy({
            RoleName: roleName,
            PolicyName: policyName,
        })
            .pipe(Effect.catchTag("NoSuchEntityException", () => Effect.void));
    }
    return { env, volumes, mountPoints };
});
/**
 * Register a new task definition revision from the shared
 * {@link TaskDefinitionConfig} surface.
 */
export const registerTaskDefinitionRevision = Effect.fn(function* ({ props, family, imageUri, taskRoleArn, executionRoleArn, logGroupName, tags, bindingVolumes = [], bindingMountPoints = [], }) {
    const { region } = yield* AWSEnvironment.current;
    const containerName = props.container?.name ?? family;
    const primaryContainer = {
        essential: true,
        name: containerName,
        image: imageUri,
        command: props.command,
        portMappings: props.port !== undefined
            ? [
                {
                    containerPort: props.port,
                    hostPort: props.port,
                    protocol: "tcp",
                },
            ]
            : undefined,
        environment: Object.entries(props.env ?? {}).map(([name, value]) => ({
            name,
            value: typeof value === "string" ? value : JSON.stringify(value),
        })),
        environmentFiles: props.environmentFiles,
        logConfiguration: {
            logDriver: "awslogs",
            options: {
                "awslogs-group": logGroupName,
                "awslogs-region": region,
                "awslogs-stream-prefix": family,
            },
        },
        ...props.container,
        // Merge binding-requested mount points (e.g. `EFS.Mount`) with any
        // the user configured on the primary container.
        ...(bindingMountPoints.length > 0
            ? {
                mountPoints: [
                    ...(props.container?.mountPoints ?? []),
                    ...bindingMountPoints,
                ],
            }
            : {}),
    };
    const response = yield* ecs.registerTaskDefinition({
        family,
        taskRoleArn,
        executionRoleArn,
        networkMode: props.networkMode ?? "awsvpc",
        requiresCompatibilities: props.requiresCompatibilities ?? ["FARGATE"],
        cpu: String(props.cpu ?? 256),
        memory: String(props.memory ?? 512),
        volumes: bindingVolumes.length > 0
            ? [...(props.volumes ?? []), ...bindingVolumes]
            : props.volumes,
        placementConstraints: props.placementConstraints,
        runtimePlatform: props.runtimePlatform,
        ephemeralStorage: props.ephemeralStorage,
        ipcMode: props.ipcMode,
        pidMode: props.pidMode,
        proxyConfiguration: props.proxyConfiguration,
        inferenceAccelerators: props.inferenceAccelerators,
        enableFaultInjection: props.enableFaultInjection,
        ...props.taskDefinition,
        containerDefinitions: [primaryContainer, ...(props.sidecars ?? [])],
        tags: Object.entries(tags).map(([key, value]) => ({ key, value })),
    });
    const taskDefinition = response.taskDefinition;
    if (!taskDefinition?.taskDefinitionArn) {
        return yield* Effect.die(new Error("registerTaskDefinition returned no task definition"));
    }
    return taskDefinition;
});
/**
 * Sync tags on a task definition revision: diff observed revision tags
 * against desired and apply the delta.
 */
export const syncTaskDefinitionTags = Effect.fn(function* ({ revisionArn, tags, }) {
    const observedTags = Object.fromEntries(((yield* ecs
        .listTagsForResource({ resourceArn: revisionArn })
        .pipe(Effect.catchTag("ClientException", () => Effect.succeed({ tags: undefined })))).tags ?? [])
        .filter((t) => typeof t.key === "string" && typeof t.value === "string")
        .map((t) => [t.key, t.value]));
    const { removed: removedTags, upsert: upsertTags } = diffTags(observedTags, tags);
    if (upsertTags.length > 0) {
        yield* ecs.tagResource({
            resourceArn: revisionArn,
            tags: upsertTags.map((t) => ({ key: t.Key, value: t.Value })),
        });
    }
    if (removedTags.length > 0) {
        yield* ecs.untagResource({
            resourceArn: revisionArn,
            tagKeys: removedTags,
        });
    }
});
/** The family segment of a task definition revision ARN (`…:task-definition/<family>:<revision>`). */
const taskFamilyOfArn = (arn) => arn.split("/").pop()?.split(":")[0];
/**
 * Reap the task-definition revision superseded by a reconcile: registering
 * always produces a NEW revision, so without this every reconcile strands
 * the previous revision ACTIVE forever. Deregister + hard-delete the prior
 * revision once the new one is registered.
 *
 * Guarded to the same family — `previousArn` can reference a foreign task
 * definition this resource does not own (e.g. an `ECS.Service` switched from
 * a BYO `task:` reference to the image-owning form), which must be left
 * untouched. Idempotent: both calls tolerate "already gone", and a revision
 * still referenced by running tasks parks in `DELETE_IN_PROGRESS` until AWS
 * finishes the delete.
 */
export const reapSupersededTaskDefinitionRevision = Effect.fn(function* ({ previousArn, nextArn, }) {
    if (previousArn === undefined ||
        previousArn === nextArn ||
        taskFamilyOfArn(previousArn) !== taskFamilyOfArn(nextArn)) {
        return;
    }
    yield* ecs
        .deregisterTaskDefinition({ taskDefinition: previousArn })
        .pipe(Effect.catchTag("ClientException", () => Effect.void));
    yield* ecs
        .deleteTaskDefinitions({ taskDefinitions: [previousArn] })
        .pipe(Effect.catchTag("ClientException", () => Effect.void));
});
/**
 * Tear down the infrastructure a task definition owns: every remaining
 * revision of the family (deregister + hard delete), the ECR repository, the
 * log group, and the task/execution roles. Idempotent — every step tolerates
 * "already gone".
 */
export const deleteTaskDefinitionInfrastructure = Effect.fn(function* (output) {
    const familyArns = output.taskFamily
        ? yield* ecs.listTaskDefinitions
            .items({
            familyPrefix: output.taskFamily,
            status: "ACTIVE",
        })
            .pipe(
        // `familyPrefix` is a prefix match — filter to the exact family so
        // a family that happens to prefix another resource's is untouched.
        // A nonexistent family is an empty list, not an error, so nothing
        // is caught here: a real list failure must propagate — swallowing
        // it would silently skip the sweep and leak the revisions.
        Stream.filter((arn) => taskFamilyOfArn(arn) === output.taskFamily), Stream.runCollect, Effect.map((chunk) => Array.from(chunk)))
        : [];
    const revisionArns = [...new Set([output.taskDefinitionArn, ...familyArns])];
    for (const arn of revisionArns) {
        yield* ecs
            .deregisterTaskDefinition({ taskDefinition: arn })
            .pipe(Effect.catchTag("ClientException", () => Effect.void));
    }
    // Deregistering only flips the revisions to INACTIVE — they still
    // exist (and show up in `listTaskDefinitions --status INACTIVE`)
    // forever. Hard-delete them so destroying a Task leaves zero
    // task-definition leftovers. `deleteTaskDefinitions` accepts at most
    // 10 ARNs per call.
    for (let i = 0; i < revisionArns.length; i += 10) {
        yield* ecs
            .deleteTaskDefinitions({
            taskDefinitions: revisionArns.slice(i, i + 10),
        })
            .pipe(Effect.catchTag("ClientException", () => Effect.void));
    }
    yield* ecr
        .deleteRepository({
        repositoryName: output.repositoryName,
        force: true,
    })
        .pipe(Effect.catchTag("RepositoryNotFoundException", () => Effect.void));
    yield* logs
        .deleteLogGroup({
        logGroupName: output.logGroupName,
    })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
    for (const roleName of [output.taskRoleName, output.executionRoleName]) {
        // Delete inline policies on BOTH roles — the task role carries the
        // bindings policy, and the execution role can carry inline policies too
        // (e.g. the Service's secrets-read policy). A role with any inline
        // policy left rejects `deleteRole` with `DeleteConflictException`.
        yield* iam.listRolePolicies
            .items({
            RoleName: roleName,
        })
            .pipe(Stream.mapEffect((policyName) => iam
            .deleteRolePolicy({
            RoleName: roleName,
            PolicyName: policyName,
        })
            .pipe(Effect.catchTag("NoSuchEntityException", () => Effect.void))), Stream.runDrain, 
        // The role may already be gone (delete re-run / race) — treat a
        // missing role as "no policies to delete" so delete is idempotent.
        Effect.catchTag("NoSuchEntityException", () => Effect.void));
        yield* iam.listAttachedRolePolicies
            .items({
            RoleName: roleName,
        })
            .pipe(Stream.mapEffect((policy) => iam
            .detachRolePolicy({
            RoleName: roleName,
            PolicyArn: policy.PolicyArn,
        })
            .pipe(Effect.catchTag("NoSuchEntityException", () => Effect.void))), Stream.runDrain, Effect.catchTag("NoSuchEntityException", () => Effect.void));
        yield* iam
            .deleteRole({
            RoleName: roleName,
        })
            .pipe(Effect.catchTag("NoSuchEntityException", () => Effect.void));
    }
});
export const TaskProvider = () => Provider.effect(Task, Effect.gen(function* () {
    const stack = yield* Stack;
    const imageSource = yield* makeImageSource;
    const alchemyEnv = {
        ALCHEMY_STACK_NAME: stack.name,
        ALCHEMY_STAGE: stack.stage,
        ALCHEMY_PHASE: "runtime",
    };
    const toTaskFamily = (id, props = {}) => props.taskName
        ? Effect.succeed(props.taskName)
        : createPhysicalName({
            id,
            maxLength: 255,
            lowercase: true,
        });
    const createRoleName = (id, suffix) => createPhysicalName({
        id: `${id}-${suffix}`,
        maxLength: 64,
    });
    const createPolicyName = (id, suffix) => createPhysicalName({
        id: `${id}-${suffix}`,
        maxLength: 128,
    });
    const createRepositoryName = (id) => createPhysicalName({
        id: `${id}-repo`,
        maxLength: 256,
        lowercase: true,
    });
    const createLogGroupName = (id) => createPhysicalName({
        id: `${id}-logs`,
        maxLength: 512,
        lowercase: true,
    });
    // Reconstruct the full `Task` Attributes shape from a described task
    // definition. Returns `undefined` for task definitions that don't match
    // the shape this provider produces (single container whose image is an
    // ECR `<repoUri>:<hash>`, task/execution role ARNs, an awslogs log group)
    // so foreign task definitions in the account are skipped by `list()`.
    const toListAttributes = (taskDefinition, region, accountId) => {
        if (!taskDefinition.taskDefinitionArn || !taskDefinition.family) {
            return undefined;
        }
        const container = taskDefinition.containerDefinitions?.[0];
        const image = container?.image;
        const taskRoleArn = taskDefinition.taskRoleArn;
        const executionRoleArn = taskDefinition.executionRoleArn;
        const logGroupName = container?.logConfiguration?.options?.["awslogs-group"];
        if (!container?.name ||
            !image ||
            !image.includes(":") ||
            !taskRoleArn ||
            !executionRoleArn ||
            !logGroupName) {
            return undefined;
        }
        const lastColon = image.lastIndexOf(":");
        const repositoryUri = image.slice(0, lastColon);
        const hash = image.slice(lastColon + 1);
        const repositoryName = repositoryUri.split("/").slice(1).join("/");
        const taskRoleName = taskRoleArn.split(":role/")[1] ?? taskRoleArn;
        const executionRoleName = executionRoleArn.split(":role/")[1] ?? executionRoleArn;
        return {
            taskDefinitionArn: taskDefinition.taskDefinitionArn,
            taskFamily: taskDefinition.family,
            containerName: container.name,
            port: container.portMappings?.[0]?.containerPort ?? 3000,
            imageUri: image,
            repositoryName,
            repositoryUri,
            taskRoleArn,
            taskRoleName,
            executionRoleArn,
            executionRoleName,
            logGroupName,
            logGroupArn: `arn:aws:logs:${region}:${accountId}:log-group:${logGroupName}`,
            code: { hash },
        };
    };
    return {
        stables: [
            "repositoryName",
            "repositoryUri",
            "taskRoleArn",
            "taskRoleName",
            "executionRoleArn",
            "executionRoleName",
            "logGroupName",
            "logGroupArn",
            "taskFamily",
        ],
        diff: Effect.fn(function* ({ id, olds, news, output }) {
            if (!isResolved(news))
                return;
            if ((yield* toTaskFamily(id, olds ?? {})) !==
                (yield* toTaskFamily(id, news ?? {}))) {
                return { action: "replace" };
            }
            // Content drift: the props don't change when files under a
            // `context` path (or the mirrored `image` ref's meaning) change —
            // nor, for `main` sources, when the user's program or the
            // generated bootstrap template changes. Hash the source (running
            // the bundler for `main`, so the hash covers the bootstrap entry)
            // and surface drift as an update; without this a bootstrap or
            // code-only change would silently no-op until `--force`.
            if (output) {
                const source = news;
                const hash = yield* imageSource.hash({
                    source,
                    platform: taskImagePlatform(news.runtimePlatform),
                    port: news.port,
                    isExternal: news.isExternal,
                    bootstrap: makeBunBootstrap(source.handler ?? "default"),
                });
                if (hash !== undefined && hash !== output.code.hash) {
                    return { action: "update" };
                }
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const family = output?.taskFamily ?? (yield* toTaskFamily(id, olds ?? {}));
            const described = yield* ecs
                .describeTaskDefinition({
                taskDefinition: output?.taskDefinitionArn ?? family,
            })
                .pipe(Effect.catchTag("ClientException", () => Effect.succeed(undefined)));
            const taskDefinition = described?.taskDefinition;
            if (!taskDefinition?.taskDefinitionArn) {
                return undefined;
            }
            if (!output) {
                return undefined;
            }
            return {
                ...output,
                taskDefinitionArn: taskDefinition.taskDefinitionArn,
                taskFamily: taskDefinition.family ?? family,
                containerName: taskDefinition.containerDefinitions?.[0]?.name ??
                    output.containerName,
                port: taskDefinition.containerDefinitions?.[0]?.portMappings?.[0]
                    ?.containerPort ?? output.port,
            };
        }),
        reconcile: Effect.fn(function* ({ id, news, bindings, output, session, }) {
            // Prefer the deployed name: regenerating would target a different
            // resource if the generator's output for this id ever drifts. (An
            // explicit taskName change arrives here as a fresh replacement
            // instance with no output.)
            const family = output?.taskFamily ?? (yield* toTaskFamily(id, news));
            const taskRoleName = output?.taskRoleName ?? (yield* createRoleName(id, "task-role"));
            const executionRoleName = output?.executionRoleName ??
                (yield* createRoleName(id, "execution-role"));
            const taskPolicyName = yield* createPolicyName(id, "task-policy");
            const repositoryName = output?.repositoryName ?? (yield* createRepositoryName(id));
            const logGroupName = output?.logGroupName ?? (yield* createLogGroupName(id));
            const tags = {
                ...(yield* createInternalTags(id)),
                ...news.tags,
            };
            // Ensure roles, repository, and log group. Each helper is
            // idempotent (creates on miss, adopts on race) so the same
            // sequence runs on initial create, adoption, or update.
            const taskRoleArn = output?.taskRoleArn ??
                (yield* createTaskRoleIfNotExists({ id, roleName: taskRoleName }));
            const executionRoleArn = output?.executionRoleArn ??
                (yield* ensureTaskExecutionRole({
                    id,
                    roleName: executionRoleName,
                    managedPolicyArns: news.executionRoleManagedPolicyArns,
                }));
            for (const policyArn of news.taskRoleManagedPolicyArns ?? []) {
                yield* iam
                    .attachRolePolicy({
                    RoleName: taskRoleName,
                    PolicyArn: policyArn,
                })
                    .pipe(Effect.catchTag("LimitExceededException", () => Effect.void));
            }
            // Environment files: the execution role reads the referenced S3
            // objects at task start.
            yield* syncEnvironmentFilesPolicy({
                roleName: executionRoleName,
                environmentFiles: news.environmentFiles,
            });
            const { env: bindingEnv, volumes: bindingVolumes, mountPoints: bindingMountPoints, } = yield* attachTaskBindings({
                roleName: taskRoleName,
                policyName: taskPolicyName,
                bindings,
            });
            const logGroupArn = output?.logGroupArn ??
                (yield* ensureTaskLogGroup({
                    id,
                    logGroupName,
                }));
            // Resolve the container image from whichever source the props
            // declare (`main` | `context` | `image`), building/mirroring and
            // pushing into the task's ECR repository, then register a new
            // task definition revision. Task definitions are versioned in
            // AWS, so registering a new revision is the unit of "update" —
            // the superseded revision is reaped after registration below.
            const source = news;
            const resolved = yield* imageSource.resolve({
                id,
                source,
                repositoryName,
                repositoryUri: output?.repositoryUri && output.repositoryName === repositoryName
                    ? output.repositoryUri
                    : undefined,
                tags,
                platform: taskImagePlatform(news.runtimePlatform),
                port: news.port,
                isExternal: news.isExternal,
                bootstrap: makeBunBootstrap(source.handler ?? "default"),
                session,
            });
            const taskDefinition = yield* registerTaskDefinitionRevision({
                props: {
                    ...news,
                    env: {
                        ...bindingEnv,
                        ...alchemyEnv,
                        ...news.env,
                    },
                },
                family,
                imageUri: resolved.imageUri,
                taskRoleArn,
                executionRoleArn,
                logGroupName,
                tags,
                bindingVolumes,
                bindingMountPoints,
            });
            // Sync tags — task definition revisions carry tags at register
            // time, but tags are mutable on the revision ARN. Diff the observed
            // revision tags against desired so tag-only updates converge.
            yield* syncTaskDefinitionTags({
                revisionArn: taskDefinition.taskDefinitionArn,
                tags,
            });
            // The registration above superseded the previously-recorded
            // revision — reap it so revisions don't accumulate ACTIVE forever.
            yield* reapSupersededTaskDefinitionRevision({
                previousArn: output?.taskDefinitionArn,
                nextArn: taskDefinition.taskDefinitionArn,
            });
            yield* session.note(taskDefinition.taskDefinitionArn);
            return {
                taskDefinitionArn: taskDefinition.taskDefinitionArn,
                taskFamily: family,
                containerName: taskDefinition.containerDefinitions?.[0]?.name ?? family,
                port: news.port ?? output?.port ?? 3000,
                imageUri: resolved.imageUri,
                repositoryName: resolved.repositoryName,
                repositoryUri: resolved.repositoryUri,
                taskRoleArn,
                taskRoleName,
                executionRoleArn,
                executionRoleName,
                logGroupName,
                logGroupArn,
                code: {
                    hash: resolved.codeHash,
                },
            };
        }),
        // Enumerate every ACTIVE task definition in the account/region,
        // hydrate each via `describeTaskDefinition`, and reconstruct the full
        // Attributes shape. Foreign task definitions that don't match the shape
        // this provider produces are skipped (see `toListAttributes`).
        list: () => Effect.gen(function* () {
            const { accountId, region } = yield* AWSEnvironment.current;
            const arns = yield* ecs.listTaskDefinitions
                .pages({ status: "ACTIVE" })
                .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.taskDefinitionArns ?? [])));
            const rows = yield* Effect.forEach(arns, (arn) => ecs.describeTaskDefinition({ taskDefinition: arn }).pipe(Effect.map((described) => described.taskDefinition
                ? toListAttributes(described.taskDefinition, region, accountId)
                : undefined), Effect.catchTag("ClientException", () => Effect.succeed(undefined))), { concurrency: 10 });
            return rows.filter((row) => row !== undefined);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* deleteTaskDefinitionInfrastructure(output);
        }),
    };
}));
//# sourceMappingURL=Task.js.map