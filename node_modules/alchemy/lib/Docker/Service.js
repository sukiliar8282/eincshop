import * as Effect from "effect/Effect";
import * as Equal from "effect/Equal";
import * as Redacted from "effect/Redacted";
import * as Schedule from "effect/Schedule";
import { Unowned } from "../AdoptPolicy.js";
import { deepEqual, isResolved } from "../Diff.js";
import { Platform } from "../Platform.js";
import * as Provider from "../Provider.js";
import { createContainerRuntimeContext, } from "../Server/Process.js";
import { Stack } from "../Stack.js";
import { createInternalTags, hasAlchemyTags } from "../Tags.js";
import { Docker, dockerEngineContextName, dockerPhysicalName, } from "./Docker.js";
import { makeServiceImage } from "./ServiceImage.js";
/**
 * A Docker Swarm service: N replicas of a container kept alive by the swarm,
 * deployed through the active (or a named) Docker context.
 *
 * The target engine must be a swarm manager — `Service` wraps
 * `docker service`, swarm mode's orchestration API. Declare the swarm with
 * `Docker.Swarm` and pass it as `context` so the service deploys after the
 * swarm exists; for a plain single container on a non-swarm daemon use
 * `Docker.Container` instead.
 *
 * The service's image comes from one of two sources:
 *
 * - `image` — run a pre-built reference (a registry ref, or a `Docker.Image`
 *   / `Docker.RemoteImage` resource).
 * - `main` — bundle an inline Effect program into a generated bun image,
 *   built directly against the service's Docker context. The impl returns
 *   `{ fetch }` and may register background loops via `ServerHost.run` —
 *   the same effectful platform shape as `AWS.ECS.Service`.
 *
 * The bundled image is content-addressed and only rebuilt when the program
 * (or its generated Dockerfile) changes. It is built on the target engine's
 * local store — single-node swarms run it as-is; multi-node swarms need the
 * image on a registry every node can reach (build with `Docker.Image` +
 * `registry` and pass the pushed ref as `image` instead).
 *
 * Only replicated services are supported. Configuration changes replace the
 * service (delete-then-create); swarm tasks are stateless, so replacement is
 * cheap and avoids partially-applied `service update` drift.
 * ### Creating Services
 * **Example:** Replicated Nginx
 * ```typescript
 * const swarm = yield* Docker.Swarm("swarm");
 * const web = yield* Docker.Service("web", {
 *   context: swarm,
 *   image: "nginx:alpine",
 *   replicas: 3,
 *   ports: [{ external: 8080, internal: 80 }],
 * });
 * ```
 *
 * **Example:** Run a Built Image
 * ```typescript
 * const image = yield* Docker.Image("app-image", {
 *   build: { context: "./app" },
 * });
 * const app = yield* Docker.Service("app", {
 *   context: swarm,
 *   image,
 *   replicas: 2,
 * });
 * ```
 *
 * ### Effectful Services
 * **Example:** Inline Effect Server
 * ```typescript
 * const swarm = yield* Docker.Swarm("swarm");
 * const api = yield* Docker.Service(
 *   "Api",
 *   {
 *     context: swarm,
 *     main: import.meta.url,
 *     port: 3000,
 *     ports: [{ external: 8080, internal: 3000 }],
 *     replicas: 2,
 *   },
 *   Effect.gen(function* () {
 *     return {
 *       fetch: Effect.gen(function* () {
 *         return yield* HttpServerResponse.json({ ok: true });
 *       }),
 *     };
 *   }),
 * );
 * ```
 *
 * **Example:** Background Loops with ServerHost
 * ```typescript
 * // Class props may be an Effect, so the service can yield the swarm it
 * // deploys into (declared once at module level).
 * const Swarm = Docker.Swarm("swarm");
 *
 * export default class Worker extends Docker.Service<Worker>()(
 *   "Worker",
 *   Effect.gen(function* () {
 *     const swarm = yield* Swarm;
 *     return { context: swarm, main: import.meta.url, port: 3000 };
 *   }),
 *   Effect.gen(function* () {
 *     const host = yield* ServerHost;
 *     yield* host.run(
 *       pollQueue.pipe(Effect.repeat(Schedule.spaced("5 seconds")), Effect.asVoid),
 *     );
 *     return {
 *       fetch: Effect.succeed(HttpServerResponse.text("ok")),
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
 * ### Docker Contexts
 * **Example:** Deploy to a Remote Swarm over SSH
 * ```typescript
 * const vps = yield* Docker.Context("vps", {
 *   docker: "host=ssh://deploy@example.com",
 * });
 * const swarm = yield* Docker.Swarm("swarm", {
 *   context: vps,
 *   advertiseAddr: "10.0.0.1",
 * });
 * const app = yield* Docker.Service("app", {
 *   context: swarm,
 *   image: "nginx:alpine",
 *   replicas: 3,
 * });
 * ```
 *
 * ### Networks & Volumes
 * **Example:** Overlay Network with Aliases
 * ```typescript
 * const network = yield* Docker.Network("app-net", {
 *   context: swarm,
 *   driver: "overlay",
 * });
 * const db = yield* Docker.Service("db", {
 *   context: swarm,
 *   image: "postgres:18-alpine",
 *   networks: [{ name: network.name, aliases: ["postgres"] }],
 *   volumes: [{ hostPath: "pg-data", containerPath: "/var/lib/postgresql/data" }],
 * });
 * ```
 *
 * ### Rollouts & Placement
 * **Example:** Rolling Update with Rollback
 * ```typescript
 * const app = yield* Docker.Service("app", {
 *   image: "ghcr.io/acme/app:latest",
 *   replicas: 4,
 *   updateConfig: {
 *     parallelism: 1,
 *     delay: "10s",
 *     failureAction: "rollback",
 *     order: "start-first",
 *   },
 *   placement: {
 *     constraints: ["node.role==worker"],
 *     maxReplicasPerNode: 2,
 *   },
 * });
 * ```
 *
 * ### Secrets & Configs
 * **Example:** Mount Swarm Secrets
 * ```typescript
 * const app = yield* Docker.Service("app", {
 *   image: "ghcr.io/acme/app:latest",
 *   secrets: [{ source: "db-password", target: "db_password", mode: 0o400 }],
 *   configs: [{ source: "app-config", target: "/etc/app/config.yaml" }],
 * });
 * ```
 *
 * @resource
 */
export const Service = Platform("Docker.Service", {
    createRuntimeContext: createContainerRuntimeContext("Docker.Service"),
});
/** True when the props declare a bundled `main` program. */
const isBundledService = (props) => typeof props.main === "string";
export const ServiceProvider = () => Provider.effect(Service, Effect.gen(function* () {
    const docker = yield* Docker;
    const stack = yield* Stack;
    const serviceImage = yield* makeServiceImage;
    // The bundled program's bootstrap reads these to rebuild the Stack at
    // container runtime (same contract as the ECS bootstrap).
    const alchemyEnv = {
        ALCHEMY_STACK_NAME: stack.name,
        ALCHEMY_STAGE: stack.stage,
        ALCHEMY_PHASE: "runtime",
    };
    const inspect = (id, context) => docker.service.inspect(id, context).pipe(Effect.map((result) => normalizeServiceInspect(result)), Effect.catchReason("PlatformError", "NotFound", () => Effect.undefined));
    /**
     * Resolve the image the service should run: build the bundled `main`
     * program (content-addressed, skipped when already present in the
     * target engine) or normalize the pre-built reference.
     */
    const resolveImage = Effect.fn(function* (id, props, name, context, session) {
        if (isBundledService(props)) {
            return yield* serviceImage.resolve({
                id,
                source: props,
                name,
                context,
                isExternal: props.isExternal,
                session,
            });
        }
        return {
            imageRef: normalizeImageRef(props.image),
            codeHash: undefined,
        };
    });
    return Service.Provider.of({
        list: () => Effect.succeed([]),
        read: Effect.fn(function* ({ id, instanceId, olds, output }) {
            const name = yield* servicePhysicalName(id, olds, instanceId);
            const context = dockerEngineContextName(olds?.context);
            const live = yield* inspect(name, context);
            if (!live)
                return undefined;
            ensureReplicatedMode(live);
            const attrs = toServiceAttributes(live, context, output?.code);
            if (output)
                return attrs;
            const owned = yield* hasAlchemyTags(id, live.Spec.Labels ?? undefined);
            return owned ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, instanceId, news, olds, output }) {
            if (!isResolved(news))
                return undefined;
            const oldDesired = yield* normalizeDesired(id, olds, instanceId);
            const newDesired = yield* normalizeDesired(id, news, instanceId);
            if (!Equal.equals(oldDesired, newDesired)) {
                return { action: "replace", deleteFirst: true };
            }
            // Bundled program: the image identity is the content hash — a code
            // or bootstrap change replaces the service with the new image.
            if (isBundledService(news)) {
                const hash = yield* serviceImage.hash({
                    source: news,
                    isExternal: news.isExternal,
                });
                if (hash !== output?.code?.hash) {
                    return { action: "replace", deleteFirst: true };
                }
            }
            return { action: "noop" };
        }),
        reconcile: Effect.fn(function* ({ id, instanceId, news, olds, output, session, }) {
            const desired = yield* normalizeDesired(id, news, instanceId);
            const resolved = yield* resolveImage(id, news, desired.name, desired.context, session);
            const image = resolved.imageRef;
            const code = resolved.codeHash
                ? { hash: resolved.codeHash }
                : undefined;
            const environment = isBundledService(news)
                ? { ...alchemyEnv, ...desired.environment }
                : desired.environment;
            if (output && olds) {
                const oldDesired = yield* normalizeDesired(id, olds, instanceId);
                if (deepEqual(oldDesired, desired) &&
                    (resolved.codeHash === undefined ||
                        resolved.codeHash === output.code?.hash)) {
                    const current = yield* inspect(output.id, desired.context);
                    if (current) {
                        ensureReplicatedMode(current);
                        return toServiceAttributes(current, desired.context, code);
                    }
                }
            }
            if (output) {
                const current = yield* inspect(output.id, desired.context);
                if (current) {
                    ensureReplicatedMode(current);
                    const internalTags = yield* createInternalTags(id);
                    const allDesiredLabels = { ...internalTags, ...desired.labels };
                    const currentLabels = current.Spec.Labels ?? {};
                    const labelsToRemove = Object.keys(currentLabels).filter((k) => !(k in allDesiredLabels));
                    yield* docker.service.update({
                        context: desired.context,
                        id: output.id,
                        image,
                        replicas: desired.replicas,
                        "endpoint-mode": desired.endpointMode,
                        "constraint-add": desired.constraints,
                        "replicas-max-per-node": desired.maxReplicasPerNode,
                        "placement-pref": desired.preferences,
                        "update-parallelism": desired.updateConfig?.parallelism,
                        "update-delay": desired.updateConfig?.delay,
                        "update-monitor": desired.updateConfig?.monitor,
                        "update-failure-action": desired.updateConfig?.failureAction,
                        "update-max-failure-ratio": desired.updateConfig?.maxFailureRatio,
                        "update-order": desired.updateConfig?.order,
                        "rollback-parallelism": desired.rollbackConfig?.parallelism,
                        "rollback-delay": desired.rollbackConfig?.delay,
                        "rollback-monitor": desired.rollbackConfig?.monitor,
                        "rollback-failure-action": desired.rollbackConfig?.failureAction,
                        "rollback-max-failure-ratio": desired.rollbackConfig?.maxFailureRatio,
                        "rollback-order": desired.rollbackConfig?.order,
                        "restart-condition": desired.restartPolicy?.condition,
                        "restart-delay": desired.restartPolicy?.delay,
                        "restart-max-attempts": desired.restartPolicy?.maxAttempts,
                        "restart-window": desired.restartPolicy?.window,
                        "health-cmd": desired.healthcheck
                            ? Array.isArray(desired.healthcheck.cmd)
                                ? desired.healthcheck.cmd.join(" ")
                                : desired.healthcheck.cmd
                            : undefined,
                        "health-interval": desired.healthcheck?.interval,
                        "health-timeout": desired.healthcheck?.timeout,
                        "health-retries": desired.healthcheck?.retries,
                        "health-start-period": desired.healthcheck?.startPeriod,
                        "stop-grace-period": desired.stopGracePeriod,
                        "mount-add": desired.volumes.map(formatMount),
                        "secret-add": desired.secrets.map(formatRef),
                        "config-add": desired.configs.map(formatRef),
                        "read-only": desired.readOnlyRootFs || undefined,
                        "publish-add": desired.ports.map(formatPublish),
                        "label-add": allDesiredLabels,
                        "label-rm": labelsToRemove,
                        "env-add": environment,
                        args: desired.command.length > 0
                            ? desired.command.concat(desired.args).join(" ")
                            : undefined,
                    });
                    return toServiceAttributes(yield* inspectOrDie(inspect, output.id, desired.context), desired.context, code);
                }
            }
            const existingByName = yield* inspect(desired.name, desired.context);
            if (existingByName) {
                ensureReplicatedMode(existingByName);
                return toServiceAttributes(existingByName, desired.context, code);
            }
            const internalTags = yield* createInternalTags(id);
            const allDesiredLabels = { ...internalTags, ...desired.labels };
            yield* docker.service.create({
                context: desired.context,
                name: desired.name,
                image,
                replicas: desired.replicas,
                "endpoint-mode": desired.endpointMode,
                network: desired.networks.map((n) => [
                    `name=${n.name}`,
                    ...(n.aliases ?? []).map((a) => `alias=${a}`),
                ].join(",")),
                constraint: desired.constraints,
                "replicas-max-per-node": desired.maxReplicasPerNode,
                "placement-pref": desired.preferences,
                "update-parallelism": desired.updateConfig?.parallelism,
                "update-delay": desired.updateConfig?.delay,
                "update-monitor": desired.updateConfig?.monitor,
                "update-failure-action": desired.updateConfig?.failureAction,
                "update-max-failure-ratio": desired.updateConfig?.maxFailureRatio,
                "update-order": desired.updateConfig?.order,
                "rollback-parallelism": desired.rollbackConfig?.parallelism,
                "rollback-delay": desired.rollbackConfig?.delay,
                "rollback-monitor": desired.rollbackConfig?.monitor,
                "rollback-failure-action": desired.rollbackConfig?.failureAction,
                "rollback-max-failure-ratio": desired.rollbackConfig?.maxFailureRatio,
                "rollback-order": desired.rollbackConfig?.order,
                "restart-condition": desired.restartPolicy?.condition,
                "restart-delay": desired.restartPolicy?.delay,
                "restart-max-attempts": desired.restartPolicy?.maxAttempts,
                "restart-window": desired.restartPolicy?.window,
                "health-cmd": desired.healthcheck
                    ? Array.isArray(desired.healthcheck.cmd)
                        ? desired.healthcheck.cmd.join(" ")
                        : desired.healthcheck.cmd
                    : undefined,
                "health-interval": desired.healthcheck?.interval,
                "health-timeout": desired.healthcheck?.timeout,
                "health-retries": desired.healthcheck?.retries,
                "health-start-period": desired.healthcheck?.startPeriod,
                "stop-grace-period": desired.stopGracePeriod,
                mount: desired.volumes.map(formatMount),
                secret: desired.secrets.map(formatRef),
                config: desired.configs.map(formatRef),
                "read-only": desired.readOnlyRootFs || undefined,
                publish: desired.ports.map(formatPublish),
                label: allDesiredLabels,
                env: environment,
                command: desired.command,
                args: desired.args,
            });
            return toServiceAttributes(yield* inspectOrDie(inspect, desired.name, desired.context), desired.context, code);
        }),
        delete: Effect.fn(({ output }) => docker
            .run([
            ...(output.context ? ["--context", output.context] : []),
            "service",
            "scale",
            "--detach=false",
            `${output.id}=0`,
        ])
            .pipe(Effect.flatMap(() => docker.service.remove(output.id, output.context)), Effect.flatMap(() => waitForServiceContainersReleased(docker, output.id, output.context)), Effect.catchReason("PlatformError", "NotFound", () => Effect.void), 
        // Best-effort: drop the content-addressed image built for a
        // bundled program so replaced/destroyed services don't strand
        // local image tags.
        Effect.andThen(output.code
            ? docker.image
                .remove(output.image, true, output.context)
                .pipe(Effect.catchCause(() => Effect.void))
            : Effect.void))),
    });
}));
/** Swarm rejects service names longer than 63 characters. */
const servicePhysicalName = (id, props, instanceId) => dockerPhysicalName(id, props, instanceId, 63);
const normalizeDesired = (id, props, instanceId) => servicePhysicalName(id, props, instanceId).pipe(Effect.map((name) => ({
    name,
    context: dockerEngineContextName(props.context),
    // The bundled form's image identity is its content hash (compared
    // separately in diff) — the `image` prop is only the environment base
    // there, and it participates in the hash.
    image: isBundledService(props)
        ? undefined
        : normalizeImageRef(props.image),
    command: props.command ?? [],
    args: props.args ?? [],
    environment: {
        ...normalizeEnvironment(props.environment),
        ...normalizeBoundEnv(props.env),
    },
    networks: normalizeNetworks(props.networks),
    ports: normalizePorts(props.ports),
    endpointMode: props.endpointMode ?? "vip",
    replicas: normalizeReplicas(props.replicas),
    constraints: [
        ...(props.constraints ?? []),
        ...(props.placement?.constraints ?? []),
    ],
    maxReplicasPerNode: props.placement?.maxReplicasPerNode,
    preferences: props.placement?.preferences ?? [],
    updateConfig: props.updateConfig,
    rollbackConfig: props.rollbackConfig,
    restartPolicy: props.restartPolicy,
    healthcheck: props.healthcheck,
    stopGracePeriod: props.stopGracePeriod,
    volumes: props.volumes ?? [],
    secrets: props.secrets ?? [],
    configs: props.configs ?? [],
    readOnlyRootFs: props.readOnlyRootFs ?? false,
    labels: props.labels ?? {},
})));
const normalizeImageRef = (image) => typeof image === "string" ? image : image.imageRef;
const normalizeEnvironment = (environment) => Object.fromEntries(Object.entries(environment ?? {}).map(([key, value]) => [
    key,
    Redacted.isRedacted(value) ? Redacted.value(value) : value,
]));
/**
 * Platform-injected env (`props.env`) after Output resolution: values are
 * usually marker-packed strings, but tolerate Redacted and structured values.
 */
const normalizeBoundEnv = (env) => Object.fromEntries(Object.entries(env ?? {}).map(([key, value]) => [
    key,
    typeof value === "string"
        ? value
        : Redacted.isRedacted(value)
            ? Redacted.value(value)
            : JSON.stringify(value),
]));
const normalizePorts = (ports) => (ports ?? []).map((port) => ({
    external: port.external,
    internal: port.internal,
    protocol: port.protocol ?? "tcp",
    mode: port.mode ?? "ingress",
}));
const normalizeReplicas = (replicas) => {
    const value = replicas ?? 1;
    if (!Number.isInteger(value) || value < 0) {
        throw new Error("Service.replicas must be an integer >= 0");
    }
    return value;
};
const normalizeNetworks = (networks) => (networks ?? []).map((network) => typeof network === "string"
    ? { name: network }
    : { name: network.name, aliases: network.aliases });
const formatMount = (volume) => [
    `type=${/^(\/|\.\/|\.\.\/|~)/.test(volume.hostPath) ? "bind" : "volume"}`,
    `source=${volume.hostPath}`,
    `target=${volume.containerPath}`,
    ...(volume.readOnly ? ["readonly=true"] : []),
].join(",");
const formatRef = (ref) => Object.entries(ref)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${value}`)
    .join(",");
const formatPublish = (port) => [
    ...(port.external !== undefined ? [`published=${port.external}`] : []),
    `target=${port.internal}`,
    `protocol=${port.protocol ?? "tcp"}`,
    `mode=${port.mode ?? "ingress"}`,
].join(",");
const toServiceAttributes = (service, context, code) => {
    return {
        id: service.ID,
        name: service.Spec.Name,
        context,
        image: service.Spec.TaskTemplate?.ContainerSpec?.Image ?? "",
        replicas: service.Spec.Mode?.Replicated?.Replicas ?? 1,
        networks: (service.Spec.TaskTemplate?.Networks ?? []).flatMap((n) => n.Target ? [n.Target] : []),
        ports: (service.Spec.EndpointSpec?.Ports ?? []).flatMap((port) => {
            if (port.PublishedPort === undefined || port.TargetPort === undefined) {
                return [];
            }
            return [
                {
                    external: port.PublishedPort,
                    internal: port.TargetPort,
                    protocol: port.Protocol ?? "tcp",
                    mode: port.PublishMode ?? "ingress",
                },
            ];
        }),
        labels: service.Spec.Labels ?? {},
        endpointMode: service.Spec.EndpointSpec?.Mode ?? "vip",
        createdAt: Date.parse(service.CreatedAt ?? "") || Date.now(),
        updatedAt: Date.parse(service.UpdatedAt ?? "") || Date.now(),
        code,
    };
};
const ensureReplicatedMode = (service) => {
    if (service.Spec.Mode?.Global !== undefined) {
        throw new Error(`Docker.Service only supports replicated services. Service "${service.Spec.Name}" is global.`);
    }
};
const parseInspectArray = (json) => {
    const parsed = JSON.parse(json);
    if (parsed.length === 0) {
        throw new Error("docker inspect returned no objects");
    }
    return parsed[0];
};
const normalizeServiceInspect = (value) => {
    if (typeof value === "object" && value !== null && "stdout" in value) {
        const stdout = value.stdout;
        if (typeof stdout === "string") {
            return parseInspectArray(stdout);
        }
    }
    return value;
};
const inspectOrDie = (inspect, nameOrId, context) => inspect(nameOrId, context).pipe(Effect.flatMap((value) => value
    ? Effect.succeed(value)
    : Effect.die(`Expected ${nameOrId} to exist after create`)));
const waitForServiceContainersReleased = (docker, serviceId, context) => {
    const maxAttempts = 10;
    const noContainers = Symbol.for("Docker.Service.NoContainers");
    const poll = listServiceContainerIds(docker, serviceId, context).pipe(Effect.flatMap((containerIds) => containerIds.length === 0
        ? Effect.fail(noContainers)
        : Effect.succeed(containerIds)));
    return poll.pipe(Effect.repeat(Schedule.spaced("1 second").pipe(Schedule.upTo({ times: maxAttempts - 1 }))), Effect.catchIf((error) => error === noContainers, () => Effect.void), Effect.andThen(listServiceContainerIds(docker, serviceId, context)), Effect.flatMap((containerIds) => containerIds.length === 0
        ? Effect.void
        : // Best effort cleanup for lingering task containers that keep volumes attached.
            Effect.forEach(containerIds, (containerId) => docker
                .run([
                ...(context ? ["--context", context] : []),
                "container",
                "rm",
                "-f",
                containerId,
            ])
                .pipe(Effect.catchCause(() => Effect.void)), { concurrency: "unbounded" }).pipe(Effect.as(undefined))));
};
const listServiceContainerIds = (docker, serviceId, context) => docker
    .run([
    ...(context ? ["--context", context] : []),
    "ps",
    "-a",
    "--filter",
    `label=com.docker.swarm.service.id=${serviceId}`,
    "--format",
    "{{.ID}}",
])
    .pipe(Effect.map((result) => result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)));
//# sourceMappingURL=Service.js.map