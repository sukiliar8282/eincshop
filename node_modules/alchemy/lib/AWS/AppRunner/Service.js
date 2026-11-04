import * as apprunner from "@distilled.cloud/aws/apprunner";
import * as logs from "@distilled.cloud/aws/cloudwatch-logs";
import * as ecr from "@distilled.cloud/aws/ecr";
import * as iam from "@distilled.cloud/aws/iam";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { AlchemyContext } from "../../AlchemyContext.js";
import * as Bundle from "../../Bundle/Bundle.js";
import { findCwdForBundle, getStableContextDir, resolveMainPath, } from "../../Bundle/TempRoot.js";
import { isResolved } from "../../Diff.js";
import { Docker } from "../../Docker/Docker.js";
import { createPhysicalName } from "../../PhysicalName.js";
import { Platform } from "../../Platform.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createHostRuntimeContext, } from "../../Server/Process.js";
import { Stack } from "../../Stack.js";
import { createInternalTags, createTagsList, hasAlchemyTags, hasTags, } from "../../Tags.js";
import { toSeconds } from "../../Util/Duration.js";
import { buildAndPushEcrImage } from "../ECR/Image.js";
import { AWSEnvironment } from "../Environment.js";
import { readAppRunnerTags, syncAppRunnerTags, toWireTags, } from "./internal.js";
/**
 * An AWS App Runner service — the zero-infrastructure way to run a
 * container behind an HTTPS endpoint: App Runner provisions,
 * load-balances, scales, and patches the fleet for you. Service creation
 * and deletion are asynchronous and take several minutes; the provider
 * waits (bounded) for operations to settle.
 *
 * `Service` is a Platform: alongside the low-level container-image form
 * (`imageRepository`), it supports Effect-native implementations — an
 * inline Effect HTTP program that Alchemy bundles, containerizes, pushes
 * to a managed ECR repository, and deploys, provisioning the instance and
 * ECR access roles automatically. Capability bindings (e.g. DynamoDB
 * `GetItem`) attach IAM policy statements to the managed instance role.
 * ### Creating a Service
 * **Example:** Public ECR Image
 * ```typescript
 * const service = yield* AppRunner.Service("Hello", {
 *   imageRepository: {
 *     imageIdentifier: "public.ecr.aws/aws-containers/hello-app-runner:latest",
 *     imageRepositoryType: "ECR_PUBLIC",
 *     port: "8000",
 *   },
 *   instanceConfiguration: { cpu: "256", memory: "512" },
 * });
 * // service.serviceUrl -> "xxxxxxxx.us-west-2.awsapprunner.com"
 * ```
 *
 * **Example:** Private ECR Image with Access Role
 * ```typescript
 * const service = yield* AppRunner.Service("Api", {
 *   imageRepository: {
 *     imageIdentifier: `${repository.repositoryUri}:latest`,
 *     imageRepositoryType: "ECR",
 *     port: "8080",
 *     runtimeEnvironmentVariables: { NODE_ENV: "production" },
 *   },
 *   accessRoleArn: accessRole.roleArn,
 *   autoDeploymentsEnabled: true,
 * });
 * ```
 *
 * ### Effect-Native Services
 * **Example:** Inline Effect HTTP Program
 * ```typescript
 * export default class Api extends AppRunner.Service<Api>()(
 *   "Api",
 *   {
 *     main: import.meta.url,
 *     port: 3000,
 *     instanceConfiguration: { cpu: "256", memory: "512" },
 *   },
 *   Effect.gen(function* () {
 *     return {
 *       fetch: Effect.gen(function* () {
 *         const request = yield* HttpServerRequest;
 *         return HttpServerResponse.text("hello from app runner");
 *       }),
 *     };
 *   }),
 * ) {}
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
 * ### Scaling and Networking
 * **Example:** Custom Auto Scaling and VPC Egress
 * ```typescript
 * const service = yield* AppRunner.Service("Api", {
 *   imageRepository: {
 *     imageIdentifier: "public.ecr.aws/aws-containers/hello-app-runner:latest",
 *     imageRepositoryType: "ECR_PUBLIC",
 *     port: "8000",
 *   },
 *   autoScalingConfigurationArn: scaling.autoScalingConfigurationArn,
 *   networkConfiguration: {
 *     egressType: "VPC",
 *     vpcConnectorArn: connector.vpcConnectorArn,
 *   },
 * });
 * ```
 *
 * @resource
 */
export const Service = Platform("AWS.AppRunner.Service", {
    createRuntimeContext: createHostRuntimeContext("AWS.AppRunner.Service"),
});
class AppRunnerServiceNotSettled extends Data.TaggedError("AppRunnerServiceNotSettled") {
}
/**
 * Case-insensitive status comparison — App Runner returns lowercase
 * statuses for some resource types despite documenting uppercase.
 */
const statusIs = (status, expected) => status?.toUpperCase() === expected;
/** Normalize the vCPU-style CPU forms to the numeric wire echo. */
const normalizeCpu = (cpu) => ({
    "0.25 vCPU": "256",
    "0.5 vCPU": "512",
    "1 vCPU": "1024",
    "2 vCPU": "2048",
    "4 vCPU": "4096",
})[cpu] ?? cpu;
/** Normalize the GB-style memory forms to the numeric wire echo. */
const normalizeMemory = (memory) => ({
    "0.5 GB": "512",
    "1 GB": "1024",
    "2 GB": "2048",
    "3 GB": "3072",
    "4 GB": "4096",
    "6 GB": "6144",
    "8 GB": "8192",
    "10 GB": "10240",
    "12 GB": "12288",
})[memory] ?? memory;
/** Unwrap distilled's sensitive-string decoding to a plain value. */
const plain = (value) => value === undefined || typeof value === "string"
    ? value
    : Redacted.value(value);
const plainRecord = (record) => Object.fromEntries(Object.entries(record ?? {}).flatMap(([key, value]) => {
    const v = plain(value);
    return v === undefined ? [] : [[key, v]];
}));
const sameRecord = (a, b) => {
    const aKeys = Object.keys(a).sort();
    const bKeys = Object.keys(b).sort();
    return (aKeys.length === bKeys.length &&
        aKeys.every((k, i) => k === bKeys[i] && a[k] === b[k]));
};
const toWireSource = (props) => ({
    ImageRepository: {
        ImageIdentifier: props.imageRepository.imageIdentifier,
        ImageRepositoryType: props.imageRepository.imageRepositoryType,
        ImageConfiguration: {
            Port: props.imageRepository.port,
            StartCommand: props.imageRepository.startCommand,
            RuntimeEnvironmentVariables: props.imageRepository.runtimeEnvironmentVariables,
            RuntimeEnvironmentSecrets: props.imageRepository.runtimeEnvironmentSecrets,
        },
    },
    AutoDeploymentsEnabled: props.autoDeploymentsEnabled,
    AuthenticationConfiguration: props.accessRoleArn
        ? { AccessRoleArn: props.accessRoleArn }
        : undefined,
});
const toWireInstance = (instance) => instance === undefined
    ? undefined
    : {
        Cpu: instance.cpu,
        Memory: instance.memory,
        InstanceRoleArn: instance.instanceRoleArn,
    };
const toWireHealthCheck = (healthCheck) => healthCheck === undefined
    ? undefined
    : {
        Protocol: healthCheck.protocol,
        Path: healthCheck.path,
        Interval: toSeconds(healthCheck.interval),
        Timeout: toSeconds(healthCheck.timeout),
        HealthyThreshold: healthCheck.healthyThreshold,
        UnhealthyThreshold: healthCheck.unhealthyThreshold,
    };
const toWireNetwork = (network) => network === undefined
    ? undefined
    : {
        EgressConfiguration: network.egressType !== undefined ||
            network.vpcConnectorArn !== undefined
            ? {
                EgressType: network.egressType,
                VpcConnectorArn: network.vpcConnectorArn,
            }
            : undefined,
        IngressConfiguration: network.isPubliclyAccessible !== undefined
            ? { IsPubliclyAccessible: network.isPubliclyAccessible }
            : undefined,
        IpAddressType: network.ipAddressType,
    };
const toWireObservability = (observability) => observability === undefined
    ? undefined
    : {
        ObservabilityEnabled: observability.observabilityEnabled,
        ObservabilityConfigurationArn: observability.observabilityConfigurationArn,
    };
/**
 * True when any user-specified aspect of the source configuration differs
 * from the observed one. Only fields the user actually specified are
 * compared — the service fills in defaults that must not trigger
 * spurious deployments.
 */
const sourceDrifted = (news, observed) => {
    const image = observed?.ImageRepository;
    const config = image?.ImageConfiguration;
    const desired = news.imageRepository;
    return (image?.ImageIdentifier !== desired.imageIdentifier ||
        image?.ImageRepositoryType !== desired.imageRepositoryType ||
        (desired.port !== undefined && config?.Port !== desired.port) ||
        (desired.startCommand !== undefined &&
            plain(config?.StartCommand) !== desired.startCommand) ||
        (desired.runtimeEnvironmentVariables !== undefined &&
            !sameRecord(plainRecord(config?.RuntimeEnvironmentVariables), desired.runtimeEnvironmentVariables)) ||
        (desired.runtimeEnvironmentSecrets !== undefined &&
            !sameRecord(plainRecord(config?.RuntimeEnvironmentSecrets), desired.runtimeEnvironmentSecrets)) ||
        (news.autoDeploymentsEnabled !== undefined &&
            observed?.AutoDeploymentsEnabled !== news.autoDeploymentsEnabled) ||
        (news.accessRoleArn !== undefined &&
            observed?.AuthenticationConfiguration?.AccessRoleArn !==
                news.accessRoleArn));
};
const instanceDrifted = (desired, observed) => desired !== undefined &&
    ((desired.cpu !== undefined &&
        normalizeCpu(observed?.Cpu ?? "") !== normalizeCpu(desired.cpu)) ||
        (desired.memory !== undefined &&
            normalizeMemory(observed?.Memory ?? "") !==
                normalizeMemory(desired.memory)) ||
        (desired.instanceRoleArn !== undefined &&
            observed?.InstanceRoleArn !== desired.instanceRoleArn));
const healthCheckDrifted = (desired, observed) => desired !== undefined &&
    ((desired.protocol !== undefined &&
        observed?.Protocol !== desired.protocol) ||
        (desired.path !== undefined && observed?.Path !== desired.path) ||
        (desired.interval !== undefined &&
            observed?.Interval !== toSeconds(desired.interval)) ||
        (desired.timeout !== undefined &&
            observed?.Timeout !== toSeconds(desired.timeout)) ||
        (desired.healthyThreshold !== undefined &&
            observed?.HealthyThreshold !== desired.healthyThreshold) ||
        (desired.unhealthyThreshold !== undefined &&
            observed?.UnhealthyThreshold !== desired.unhealthyThreshold));
const networkDrifted = (desired, observed) => desired !== undefined &&
    ((desired.egressType !== undefined &&
        observed?.EgressConfiguration?.EgressType !== desired.egressType) ||
        (desired.vpcConnectorArn !== undefined &&
            observed?.EgressConfiguration?.VpcConnectorArn !==
                desired.vpcConnectorArn) ||
        (desired.isPubliclyAccessible !== undefined &&
            observed?.IngressConfiguration?.IsPubliclyAccessible !==
                desired.isPubliclyAccessible) ||
        (desired.ipAddressType !== undefined &&
            observed?.IpAddressType !== desired.ipAddressType));
const observabilityDrifted = (desired, observed) => desired !== undefined &&
    ((observed?.ObservabilityEnabled ?? false) !== desired.observabilityEnabled ||
        (desired.observabilityConfigurationArn !== undefined &&
            // App Runner echoes the resolved (revision-qualified) ARN; compare
            // on the revision-less name partial so both forms converge.
            !(observed?.ObservabilityConfigurationArn ?? "").startsWith(desired.observabilityConfigurationArn.split("/").slice(0, 2).join("/"))));
const emptyPlatformAttributes = {
    imageUri: undefined,
    repositoryName: undefined,
    repositoryUri: undefined,
    instanceRoleArn: undefined,
    instanceRoleName: undefined,
    accessRoleArn: undefined,
    accessRoleName: undefined,
    codeHash: undefined,
};
/**
 * The two CloudWatch log groups App Runner auto-creates for a service:
 * `.../application` (the container's stdout/stderr) and `.../service`
 * (App Runner's own deployment and health-check events).
 *
 * Both names embed the AWS-generated service id, so a pair belongs to
 * exactly one service instance — it can never be shared with, or reused
 * by, another service.
 */
const logGroupNamesFor = (serviceName, serviceId) => [
    `/aws/apprunner/${serviceName}/${serviceId}/application`,
    `/aws/apprunner/${serviceName}/${serviceId}/service`,
];
/**
 * Delete one of a service's auto-created log groups, idempotently.
 *
 * `deleteService` does NOT remove them, so without this every
 * deploy+destroy cycle strands a pair (matching how the Lambda and ECS
 * providers reap `/aws/lambda/{name}` and their task log group).
 *
 * App Runner can flush a final batch of events after the service itself
 * is gone, silently re-creating a just-deleted group, so the delete is
 * followed by a bounded observe→delete convergence loop. A group that
 * never reappears — the common case — costs a single extra describe.
 * Reaping is auxiliary to an already-completed service deletion, so a
 * group that survives the budget warns rather than failing the destroy.
 */
const reapLogGroup = Effect.fn(function* (logGroupName) {
    const deleteGroup = logs.deleteLogGroup({ logGroupName }).pipe(Effect.retry({
        while: (error) => error._tag === "OperationAbortedException" ||
            error._tag === "ServiceUnavailableException",
        schedule: Schedule.max([
            Schedule.exponential("250 millis"),
            Schedule.recurs(6),
        ]),
    }), Effect.catchTag("ResourceNotFoundException", () => Effect.void), Effect.timeoutOrElse({
        duration: "30 seconds",
        orElse: () => Effect.logWarning(`Timed out deleting App Runner log group ${logGroupName}`),
    }));
    // A describe that cannot complete in time is not deletion proof —
    // assume the group is still present and let the bounded loop converge.
    const observeGroup = logs
        .describeLogGroups({ logGroupNamePrefix: logGroupName, limit: 1 })
        .pipe(Effect.map((response) => (response.logGroups ?? []).some((group) => group.logGroupName === logGroupName)), Effect.timeoutOrElse({
        duration: "15 seconds",
        orElse: () => Effect.logWarning(`Timed out observing App Runner log group ${logGroupName} — assuming still present`).pipe(Effect.as(true)),
    }));
    yield* deleteGroup;
    // Re-reaps at t=0s/5s/…/30s, each attempt idempotent.
    const stillPresent = yield* Effect.gen(function* () {
        const present = yield* observeGroup;
        if (present)
            yield* deleteGroup;
        return present;
    }).pipe(Effect.repeat({
        schedule: Schedule.spaced("5 seconds"),
        until: (present) => !present,
        times: 6,
    }));
    if (stillPresent) {
        yield* Effect.logWarning(`App Runner log group ${logGroupName} kept reappearing after delete`);
    }
});
export const ServiceProvider = () => Provider.effect(Service, Effect.gen(function* () {
    const stack = yield* Stack;
    const docker = yield* Docker;
    const { dotAlchemy } = yield* AlchemyContext;
    const virtualEntryPlugin = yield* Bundle.virtualEntryPlugin;
    const alchemyEnv = {
        ALCHEMY_STACK_NAME: stack.name,
        ALCHEMY_STAGE: stack.stage,
        ALCHEMY_PHASE: "runtime",
    };
    const toName = (id, props) => props.serviceName
        ? Effect.succeed(props.serviceName)
        : createPhysicalName({ id, maxLength: 40 });
    const createRoleName = (id, suffix) => createPhysicalName({ id: `${id}-${suffix}`, maxLength: 64 });
    const createRepositoryName = (id) => createPhysicalName({
        id: `${id}-repo`,
        maxLength: 256,
        lowercase: true,
    });
    /**
     * Ensure an IAM role trusted by the given App Runner principal exists
     * (creates on miss, adopts on race when it carries our tags).
     */
    const ensureRole = Effect.fn(function* ({ id, roleName, principal, managedPolicyArns, }) {
        const tags = yield* createInternalTags(id);
        const role = yield* iam
            .createRole({
            RoleName: roleName,
            AssumeRolePolicyDocument: JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Principal: { Service: principal },
                        Action: "sts:AssumeRole",
                    },
                ],
            }),
            Tags: createTagsList(tags),
        })
            .pipe(Effect.catchTag("EntityAlreadyExistsException", () => iam.getRole({ RoleName: roleName }).pipe(Effect.filterOrFail((existing) => hasTags(tags, existing.Role?.Tags), () => new Error(`Role '${roleName}' already exists and is not managed by alchemy`)))));
        for (const policyArn of managedPolicyArns ?? []) {
            yield* iam
                .attachRolePolicy({ RoleName: roleName, PolicyArn: policyArn })
                .pipe(Effect.catchTag("LimitExceededException", () => Effect.void));
        }
        return role.Role.Arn;
    });
    /** Ensure the managed ECR repository for the built image exists. */
    const ensureRepository = Effect.fn(function* ({ repositoryName, tags, }) {
        const created = yield* ecr
            .createRepository({
            repositoryName,
            imageTagMutability: "MUTABLE",
            imageScanningConfiguration: { scanOnPush: true },
            tags: Object.entries(tags).map(([Key, Value]) => ({ Key, Value })),
        })
            .pipe(Effect.catchTag("RepositoryAlreadyExistsException", () => Effect.gen(function* () {
            const existing = yield* ecr.describeRepositories({
                repositoryNames: [repositoryName],
            });
            return { repository: existing.repositories?.[0] };
        })));
        const repository = created.repository;
        if (!repository?.repositoryUri) {
            return yield* Effect.fail(new Error(`Failed to resolve ECR repository '${repositoryName}'`));
        }
        return { repositoryUri: repository.repositoryUri };
    });
    /**
     * Attach binding-declared IAM policy statements to the managed
     * instance role and collect binding-declared environment variables.
     */
    const attachBindings = Effect.fn(function* ({ roleName, policyName, bindings, }) {
        const activeBindings = bindings.filter((binding) => binding.action !== "delete");
        const env = activeBindings
            .map((binding) => binding?.data?.env)
            .reduce((acc, value) => ({ ...acc, ...value }), {});
        const policyStatements = activeBindings.flatMap((binding) => binding?.data?.policyStatements?.map((statement) => ({
            ...statement,
            Sid: statement.Sid?.replace(/[^A-Za-z0-9]+/gi, ""),
        })) ?? []);
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
                .deleteRolePolicy({ RoleName: roleName, PolicyName: policyName })
                .pipe(Effect.catchTag("NoSuchEntityException", () => Effect.void));
        }
        return env;
    });
    /** Bundle the Effect-native program into container-ready files. */
    const bundleProgram = Effect.fn(function* (props) {
        const handler = props.handler ?? "default";
        const realMain = yield* resolveMainPath(props.main);
        const cwd = yield* findCwdForBundle(realMain);
        const buildBundle = Effect.fn(function* (entry, plugins) {
            return yield* Bundle.build({
                ...props.build?.input,
                input: entry,
                cwd,
                platform: "node",
                // The container runs on `bun`; keep `bun`/`bun:*` external (the
                // runtime provides them) and resolve the `bun` export condition
                // so `@effect/platform-bun` picks its Bun implementations.
                external: [
                    "bun",
                    "bun:*",
                    ...(props.build?.input?.external ??
                        []),
                ],
                resolve: {
                    conditionNames: [...Bundle.BUN_CONDITION_NAMES],
                    ...props.build?.input?.resolve,
                },
                plugins: [props.build?.input?.plugins, plugins],
            }, {
                ...props.build?.output,
                format: "esm",
                sourcemap: props.build?.output?.sourcemap ?? false,
                minify: props.build?.output?.minify ?? false,
                entryFileNames: "index.mjs",
            }, props.build);
        });
        const bundleOutput = props.isExternal
            ? yield* buildBundle(realMain)
            : yield* buildBundle(realMain, virtualEntryPlugin((importPath) => `
import { bootstrap } from "alchemy/Runtime/Bootstrap/AppRunner";
import { ${handler} as entrypoint } from ${JSON.stringify(importPath)};

await bootstrap(entrypoint);
`));
        // Return every emitted file (entry + shared chunks). Dynamic imports
        // in the Bun HTTP server / AWS SDK split into chunks; dropping any of
        // them crashes the container with `Cannot find module './chunk-X.js'`.
        const files = bundleOutput.files.map((file) => ({
            path: file.path,
            content: typeof file.content === "string"
                ? new TextEncoder().encode(file.content)
                : file.content,
        }));
        return { files, hash: bundleOutput.hash };
    });
    /** Build + push the container image for the bundled program. */
    const buildAndPushImage = Effect.fn(function* ({ id, repositoryUri, hash, files, props, port, }) {
        const realMain = yield* resolveMainPath(props.main);
        const contextDir = yield* getStableContextDir(realMain, dotAlchemy, `${id}-image`);
        const imageUri = `${repositoryUri}:${hash}`;
        const generatedDockerfile = (() => {
            const base = props.docker?.base ?? "public.ecr.aws/docker/library/bun:1";
            return [
                `FROM ${base}`,
                `WORKDIR /app`,
                `COPY index.mjs /app/index.mjs`,
                // Copy any additional rolldown chunks (`chunk-XXX.js`, ...).
                // Non-trivial bundles always emit at least one; minimal bundles
                // emit none and the COPY no-ops.
                `COPY *.js /app/`,
                `ENV PORT=${String(port)}`,
                `EXPOSE ${String(port)}`,
                `ENTRYPOINT ["bun", "/app/index.mjs"]`,
            ].join("\n");
        })();
        const dockerfile = props.docker?.dockerfile ?? generatedDockerfile;
        yield* docker.materialize({
            context: contextDir,
            dockerfile,
            // Entry chunk becomes `index.mjs`; all other chunks keep their
            // emitted `*.js` names so the entry's relative imports resolve.
            files: files.map((file, index) => ({
                path: index === 0 ? "index.mjs" : file.path,
                content: file.content,
            })),
        });
        // App Runner only runs x86_64 images — always build linux/amd64
        // (cross-built via emulation on ARM64 hosts).
        return yield* buildAndPushEcrImage(docker, {
            imageUri,
            context: contextDir,
            platform: "linux/amd64",
        });
    });
    /** Describe a service; a missing or DELETED service reads as absent. */
    const readService = Effect.fn(function* (arn) {
        const response = yield* apprunner
            .describeService({ ServiceArn: arn })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        const service = response?.Service;
        return service === undefined || statusIs(service.Status, "DELETED")
            ? undefined
            : service;
    });
    /** Find a live service by name (list has no name filter). */
    const findByName = Effect.fn(function* (name) {
        const summary = yield* apprunner.listServices.pages({}).pipe(Stream.map((page) => page.ServiceSummaryList ?? []), Stream.flattenIterable, Stream.filter((s) => s.ServiceName === name &&
            !statusIs(s.Status, "DELETED") &&
            s.ServiceArn !== undefined), Stream.runHead, Effect.map(Option.getOrUndefined));
        if (!summary?.ServiceArn)
            return undefined;
        return yield* readService(summary.ServiceArn);
    });
    // Create/update/delete are asynchronous; App Runner reports
    // OPERATION_IN_PROGRESS while converging. Service provisioning
    // typically takes 3-5 minutes; budget ~10 min (60 * 10s).
    const waitForSettled = Effect.fn(function* (arn) {
        return yield* readService(arn).pipe(Effect.flatMap((service) => service !== undefined &&
            statusIs(service.Status, "OPERATION_IN_PROGRESS")
            ? Effect.fail(new AppRunnerServiceNotSettled({
                serviceArn: arn,
                status: service.Status,
            }))
            : Effect.succeed(service)), Effect.retry({
            while: (e) => e instanceof AppRunnerServiceNotSettled,
            schedule: Schedule.max([
                Schedule.fixed("10 seconds"),
                Schedule.recurs(60),
            ]),
        }));
    });
    // Deletion is asynchronous too; wait until the service is gone so
    // dependencies (auto scaling configurations, VPC connectors) can be
    // deleted right after.
    const waitUntilGone = Effect.fn(function* (arn) {
        yield* readService(arn).pipe(Effect.flatMap((service) => {
            if (service === undefined)
                return Effect.void;
            if (statusIs(service.Status, "DELETE_FAILED")) {
                return Effect.fail(new Error(`App Runner service '${arn}' failed to delete (status: DELETE_FAILED)`));
            }
            return Effect.fail(new AppRunnerServiceNotSettled({
                serviceArn: arn,
                status: service.Status,
            }));
        }), Effect.retry({
            while: (e) => e instanceof AppRunnerServiceNotSettled,
            schedule: Schedule.max([
                Schedule.fixed("10 seconds"),
                Schedule.recurs(60),
            ]),
        }));
    });
    const toAttrs = (service, platform) => ({
        serviceName: service.ServiceName,
        serviceArn: service.ServiceArn,
        serviceId: service.ServiceId,
        serviceUrl: service.ServiceUrl,
        status: service.Status,
        ...platform,
    });
    const platformAttributesOf = (output) => output === undefined
        ? emptyPlatformAttributes
        : {
            imageUri: output.imageUri,
            repositoryName: output.repositoryName,
            repositoryUri: output.repositoryUri,
            instanceRoleArn: output.instanceRoleArn,
            instanceRoleName: output.instanceRoleName,
            accessRoleArn: output.accessRoleArn,
            accessRoleName: output.accessRoleName,
            codeHash: output.codeHash,
        };
    return {
        stables: [
            "serviceName",
            "serviceArn",
            "serviceId",
            "repositoryName",
            "repositoryUri",
            "instanceRoleArn",
            "instanceRoleName",
            "accessRoleArn",
            "accessRoleName",
        ],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            if ((yield* toName(id, olds ?? {})) !== (yield* toName(id, news ?? {}))) {
                return { action: "replace" };
            }
            // The encryption key is create-only.
            if ((news?.kmsKeyArn ?? undefined) !== (olds?.kmsKeyArn ?? undefined)) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const service = output?.serviceArn
                ? yield* readService(output.serviceArn)
                : yield* findByName(yield* toName(id, olds ?? {}));
            if (service === undefined)
                return undefined;
            const attrs = toAttrs(service, platformAttributesOf(output));
            const tags = yield* readAppRunnerTags(attrs.serviceArn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, bindings, output, session, }) {
            const name = output?.serviceName ?? (yield* toName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            const activeBindings = bindings.filter((binding) => binding.action !== "delete");
            // Effect-native form: bundle the program, build + push the image,
            // and provision the managed IAM roles + ECR repository, then fall
            // through to the same observe/ensure/sync flow with the derived
            // source configuration.
            let effective = news;
            let platformAttributes = emptyPlatformAttributes;
            if (news.main !== undefined) {
                const instanceRoleName = output?.instanceRoleName ??
                    (yield* createRoleName(id, "instance-role"));
                const accessRoleName = output?.accessRoleName ??
                    (yield* createRoleName(id, "access-role"));
                const policyName = yield* createPhysicalName({
                    id: `${id}-policy`,
                    maxLength: 128,
                });
                const repositoryName = output?.repositoryName ?? (yield* createRepositoryName(id));
                // Ensure roles + repository. Each helper is idempotent (creates
                // on miss, adopts on race) so the same sequence runs on initial
                // create, adoption, or update.
                const instanceRoleArn = output?.instanceRoleArn ??
                    (yield* ensureRole({
                        id,
                        roleName: instanceRoleName,
                        principal: "tasks.apprunner.amazonaws.com",
                    }));
                const accessRoleArn = output?.accessRoleArn ??
                    (yield* ensureRole({
                        id,
                        roleName: accessRoleName,
                        principal: "build.apprunner.amazonaws.com",
                        managedPolicyArns: [
                            "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess",
                        ],
                    }));
                const bindingEnv = yield* attachBindings({
                    roleName: instanceRoleName,
                    policyName,
                    bindings,
                });
                const { repositoryUri } = output?.repositoryUri && output?.repositoryName === repositoryName
                    ? { repositoryUri: output.repositoryUri }
                    : yield* ensureRepository({
                        repositoryName,
                        tags: desiredTags,
                    });
                const port = news.port ?? 3000;
                const { files, hash } = yield* bundleProgram(news);
                const imageUri = yield* buildAndPushImage({
                    id,
                    repositoryUri,
                    hash,
                    files,
                    props: news,
                    port,
                });
                // App Runner env values must be strings — JSON-encode the rest.
                const runtimeEnvironmentVariables = Object.fromEntries(Object.entries({
                    ...bindingEnv,
                    ...alchemyEnv,
                    ...news.env,
                }).map(([key, value]) => [
                    key,
                    typeof value === "string" ? value : JSON.stringify(value),
                ]));
                effective = {
                    ...news,
                    imageRepository: {
                        imageIdentifier: imageUri,
                        imageRepositoryType: "ECR",
                        port: String(port),
                        runtimeEnvironmentVariables,
                    },
                    accessRoleArn,
                    autoDeploymentsEnabled: news.autoDeploymentsEnabled ?? false,
                    instanceConfiguration: {
                        ...news.instanceConfiguration,
                        instanceRoleArn,
                    },
                };
                platformAttributes = {
                    imageUri,
                    repositoryName,
                    repositoryUri,
                    instanceRoleArn,
                    instanceRoleName,
                    accessRoleArn,
                    accessRoleName,
                    codeHash: hash,
                };
            }
            else if (activeBindings.some((binding) => (binding.data?.policyStatements?.length ?? 0) > 0 ||
                Object.keys(binding.data?.env ?? {}).length > 0)) {
                return yield* Effect.fail(new Error(`App Runner service '${name}' received capability bindings but uses ` +
                    "the low-level `imageRepository` form. Bindings attach IAM policies " +
                    "and environment variables to the Alchemy-managed instance role, " +
                    "which only exists for Effect-native services (`main`). Either use " +
                    "the Effect-native form or grant the permissions on your own " +
                    "`instanceConfiguration.instanceRoleArn`."));
            }
            if (effective.imageRepository === undefined) {
                return yield* Effect.fail(new Error(`App Runner service '${name}' needs either \`imageRepository\` ` +
                    "(container-image form) or `main` (Effect-native form)"));
            }
            const desired = effective;
            // 1. Observe — cloud state is authoritative; output is only an
            // identifier cache.
            let observed = output?.serviceArn
                ? yield* readService(output.serviceArn)
                : undefined;
            if (observed === undefined) {
                observed = yield* findByName(name);
            }
            // 2. Ensure — create if missing. A freshly-minted access role can
            // take a few seconds to become assumable by App Runner
            // (InvalidRequestException "Error in assuming access role") —
            // retry through that IAM-propagation window (bounded).
            if (observed === undefined) {
                const created = yield* apprunner
                    .createService({
                    ServiceName: name,
                    SourceConfiguration: toWireSource(desired),
                    InstanceConfiguration: toWireInstance(desired.instanceConfiguration),
                    HealthCheckConfiguration: toWireHealthCheck(desired.healthCheckConfiguration),
                    NetworkConfiguration: toWireNetwork(desired.networkConfiguration),
                    AutoScalingConfigurationArn: desired.autoScalingConfigurationArn,
                    ObservabilityConfiguration: toWireObservability(desired.observabilityConfiguration),
                    EncryptionConfiguration: desired.kmsKeyArn
                        ? { KmsKey: desired.kmsKeyArn }
                        : undefined,
                    Tags: toWireTags(desiredTags),
                })
                    .pipe(Effect.retry({
                    while: (e) => e._tag === "InvalidRequestException",
                    schedule: Schedule.max([
                        Schedule.fixed("5 seconds"),
                        Schedule.recurs(12),
                    ]),
                }));
                observed = created.Service;
            }
            // Creation and prior updates run asynchronously — wait (bounded)
            // for the service to settle before mutating it.
            const settled = yield* waitForSettled(observed.ServiceArn);
            if (settled === undefined) {
                return yield* Effect.fail(new Error(`App Runner service '${name}' disappeared while reconciling`));
            }
            observed = settled;
            if (statusIs(observed.Status, "CREATE_FAILED")) {
                return yield* Effect.fail(new Error(`App Runner service '${name}' failed to create (status: CREATE_FAILED). ` +
                    "Check the service's event and application logs in CloudWatch."));
            }
            // 3. Sync — compare each user-specified aspect against OBSERVED
            // state and send a single updateService with only the drifted
            // groups.
            const update = {};
            if (sourceDrifted(desired, observed.SourceConfiguration)) {
                update.SourceConfiguration = toWireSource(desired);
            }
            if (instanceDrifted(desired.instanceConfiguration, observed.InstanceConfiguration)) {
                update.InstanceConfiguration = toWireInstance(desired.instanceConfiguration);
            }
            if (healthCheckDrifted(desired.healthCheckConfiguration, observed.HealthCheckConfiguration)) {
                update.HealthCheckConfiguration = toWireHealthCheck(desired.healthCheckConfiguration);
            }
            if (networkDrifted(desired.networkConfiguration, observed.NetworkConfiguration)) {
                update.NetworkConfiguration = toWireNetwork(desired.networkConfiguration);
            }
            if (observabilityDrifted(desired.observabilityConfiguration, observed.ObservabilityConfiguration)) {
                update.ObservabilityConfiguration = toWireObservability(desired.observabilityConfiguration);
            }
            if (desired.autoScalingConfigurationArn !== undefined &&
                observed.AutoScalingConfigurationSummary
                    ?.AutoScalingConfigurationArn !==
                    desired.autoScalingConfigurationArn) {
                update.AutoScalingConfigurationArn =
                    desired.autoScalingConfigurationArn;
            }
            if (Object.keys(update).length > 0) {
                yield* apprunner.updateService({
                    ServiceArn: observed.ServiceArn,
                    ...update,
                });
                const updated = yield* waitForSettled(observed.ServiceArn);
                if (updated === undefined) {
                    return yield* Effect.fail(new Error(`App Runner service '${name}' disappeared while updating`));
                }
                observed = updated;
            }
            // 3b. Sync tags — diff against OBSERVED cloud tags.
            yield* syncAppRunnerTags(observed.ServiceArn, desiredTags);
            // 4. Return fresh attributes.
            yield* session.note(name);
            return toAttrs(observed, platformAttributes);
        }),
        delete: Effect.fn(function* ({ olds, output, force }) {
            // A service mid-operation rejects deletion with
            // InvalidStateException — wait (bounded) for it to settle first.
            const observed = yield* waitForSettled(output.serviceArn);
            if (observed !== undefined) {
                yield* apprunner
                    .deleteService({ ServiceArn: output.serviceArn })
                    .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void), 
                // Already deleting — deletion is in progress.
                Effect.catchTag("InvalidStateException", () => Effect.void));
                yield* waitUntilGone(output.serviceArn);
            }
            // Effect-native form: also clean up the managed ECR repository and
            // IAM roles so destroying the service leaves zero leftovers.
            if (output.repositoryName !== undefined) {
                yield* ecr
                    .deleteRepository({
                    repositoryName: output.repositoryName,
                    force: true,
                })
                    .pipe(Effect.catchTag("RepositoryNotFoundException", () => Effect.void));
            }
            for (const roleName of [
                output.instanceRoleName,
                output.accessRoleName,
            ]) {
                if (roleName === undefined)
                    continue;
                yield* iam.listRolePolicies.items({ RoleName: roleName }).pipe(Stream.mapEffect((policyName) => iam
                    .deleteRolePolicy({
                    RoleName: roleName,
                    PolicyName: policyName,
                })
                    .pipe(Effect.catchTag("NoSuchEntityException", () => Effect.void))), Stream.runDrain, 
                // The role may already be gone (delete re-run / race) —
                // treat a missing role as "no policies" so delete is
                // idempotent.
                Effect.catchTag("NoSuchEntityException", () => Effect.void));
                yield* iam.listAttachedRolePolicies
                    .items({ RoleName: roleName })
                    .pipe(Stream.mapEffect((policy) => iam
                    .detachRolePolicy({
                    RoleName: roleName,
                    PolicyArn: policy.PolicyArn,
                })
                    .pipe(Effect.catchTag("NoSuchEntityException", () => Effect.void))), Stream.runDrain, Effect.catchTag("NoSuchEntityException", () => Effect.void));
                yield* iam
                    .deleteRole({ RoleName: roleName })
                    .pipe(Effect.catchTag("NoSuchEntityException", () => Effect.void));
            }
            // Last, because the reap can sit through App Runner's final log
            // flush: an interruption during that window must not strand the
            // repository or the roles, which cost money and block re-creates.
            //
            // `retainLogGroups` keeps them; account-wide teardown (`force`)
            // overrides that opt-out, since nuke's contract is to leave
            // nothing behind. Nuke also enumerates from the cloud, so `olds`
            // carries Attributes rather than Props there and the flag reads
            // as unset anyway.
            if (!olds.retainLogGroups || force) {
                for (const logGroupName of logGroupNamesFor(output.serviceName, output.serviceId)) {
                    yield* reapLogGroup(logGroupName);
                }
            }
        }),
        list: () => apprunner.listServices.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
            .flatMap((page) => page.ServiceSummaryList ?? [])
            .flatMap((s) => s.Status !== undefined &&
            !statusIs(s.Status, "DELETED") &&
            s.ServiceName !== undefined &&
            s.ServiceArn !== undefined &&
            s.ServiceId !== undefined
            ? [
                {
                    serviceName: s.ServiceName,
                    serviceArn: s.ServiceArn,
                    serviceId: s.ServiceId,
                    serviceUrl: s.ServiceUrl,
                    status: s.Status,
                    ...emptyPlatformAttributes,
                },
            ]
            : []))),
    };
}));
//# sourceMappingURL=Service.js.map