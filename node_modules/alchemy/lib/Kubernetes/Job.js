import * as Effect from "effect/Effect";
import { isResolved } from "../Diff.js";
import { createPhysicalName } from "../PhysicalName.js";
import { Platform, } from "../Platform.js";
import * as Provider from "../Provider.js";
import { Resource } from "../Resource.js";
import { packEnvValue, unpackEnvValue, RuntimeContext, } from "../RuntimeContext.js";
import { Stack } from "../Stack.js";
import { createInternalTags } from "../Tags.js";
import * as Output from "../Output.js";
import { sha256Object } from "../Util/sha256.js";
import { findClusterAdapter, } from "./ClusterAdapter.js";
import { toConnection, } from "./Connection.js";
import { connectCluster, deleteObjects, readObject, reconcileObjects, KubernetesApiError, } from "./internal/client.js";
import { collectBindingEnv, connectionIdentity, connectionOfOutput, deepMerge, imagePlatformOf, makeJobBootstrap, resolveWorkloadImage, tryConnectionOf, workloadImageHash, } from "./internal/workload.js";
export const isJob = (value) => {
    return (typeof value === "object" &&
        value !== null &&
        "Type" in value &&
        value.Type === "Kubernetes.Job");
};
/**
 * Run-to-completion Kubernetes compute on any cluster — the Kubernetes
 * analog of `AWS.ECS.Task`.
 *
 * `Job` provisions a Kubernetes `Job` (or `CronJob` when `schedule` is
 * set) via server-side apply and a ServiceAccount, plus — through the
 * target cluster's platform adapter — workload identity and a container
 * image from exactly one of three sources flat on props: `main` (bundle an
 * inline Effect program whose impl returns `{ run }`), `context` (build
 * your own Dockerfile), or `image` (a pre-built registry reference). On
 * `AWS.EKS.Cluster` targets, bindings attach env vars to the pod and IAM
 * policy statements to a generated pod-identity role, exactly like
 * `Kubernetes.Deployment`.
 * ### Creating a Job
 * **Example:** Remote image (external — no Effect runtime in the container)
 * ```typescript
 * const migrate = yield* Kubernetes.Job("DbMigrate", {
 *   cluster,
 *   image: "ghcr.io/acme/migrator:v3",
 *   backoffLimit: 2,
 * });
 * ```
 *
 * **Example:** Inline Effect program with a DynamoDB binding (EKS)
 * ```typescript
 * const seed = yield* Kubernetes.Job(
 *   "SeedData",
 *   { cluster, main: import.meta.url },
 *   Effect.gen(function* () {
 *     const putItem = yield* AWS.DynamoDB.PutItem(table);
 *     return {
 *       run: Effect.gen(function* () {
 *         yield* putItem({ Item: { id: { S: "seed" } } });
 *       }),
 *     };
 *   }).pipe(Effect.provide(AWS.DynamoDB.PutItemHttp)),
 * );
 * ```
 *
 * **Example:** Tagged Effect program
 * ```typescript
 * export class Backfill extends Kubernetes.Job<Backfill, {
 *   progress: () => Effect.Effect<number>;
 * }>()("Backfill") {}
 *
 * export default Backfill.make(
 *   { cluster, main: import.meta.url, backoffLimit: 1 },
 *   Effect.gen(function* () {
 *     return {
 *       run: Effect.gen(function* () { }),
 *       progress: () => Effect.succeed(0),
 *     };
 *   }),
 * );
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
 * ### Scheduling
 * **Example:** Nightly CronJob
 * ```typescript
 * const nightly = yield* Kubernetes.Job("NightlyBackfill", {
 *   cluster,
 *   main: import.meta.url,
 *   schedule: "0 3 * * *",
 * });
 * ```
 *
 * @resource
 */
export const Job = Platform("Kubernetes.Job", {
    aliases: ["AWS.EKS.Job"],
    createRuntimeContext: (id) => {
        // A one-shot host context: `serve` (invoked by the Platform machinery
        // with the impl shape) registers the shape's `run` effect as the
        // program instead of an HTTP server, so the generated entry executes
        // it to completion and exits.
        const runners = [];
        const env = {};
        const context = {
            Type: "Kubernetes.Job",
            id,
            env,
            set: (bindingId, output) => Effect.sync(() => {
                const key = bindingId.replaceAll(/[^a-zA-Z0-9]/g, "_");
                env[key] = output.pipe(Output.map(packEnvValue));
                return key;
            }),
            get: (key) => Effect.sync(() => unpackEnvValue(process.env[key])),
            run: (effect) => Effect.sync(() => {
                runners.push(effect);
            }),
            serve: ((_handler, options) => Effect.sync(() => {
                const run = options?.shape?.run;
                if (Effect.isEffect(run)) {
                    runners.push(run);
                }
            })),
            exports: Effect.sync(() => ({
                program: Effect.all(runners, { concurrency: "unbounded" }).pipe(Effect.asVoid),
            })),
        };
        return context;
    },
});
const isNotFound = (error) => error instanceof KubernetesApiError && error.statusCode === 404;
export const JobProvider = () => Provider.effect(Job, Effect.gen(function* () {
    const stack = yield* Stack;
    const alchemyEnv = {
        ALCHEMY_STACK_NAME: stack.name,
        ALCHEMY_STAGE: stack.stage,
        ALCHEMY_PHASE: "runtime",
    };
    const toBaseName = (id, props = {}) => props.name
        ? Effect.succeed(props.name)
        : createPhysicalName({ id, maxLength: 200, lowercase: true }).pipe(Effect.map((name) => name.replaceAll(/[^a-z0-9-]/g, "-")));
    return {
        stables: [
            "connection",
            "namespace",
            "serviceAccountName",
            "identity",
            "registry",
        ],
        // A Job's identity spans in-cluster Kubernetes objects plus
        // adapter-owned cloud resources — no single enumeration
        // reconstructs the composite, so enumeration is empty; `read`
        // refreshes known instances.
        list: () => Effect.succeed([]),
        diff: Effect.fn(function* ({ olds = {}, news, output }) {
            if (!isResolved(news))
                return;
            const oldCluster = connectionIdentity(tryConnectionOf(olds.cluster));
            const newCluster = connectionIdentity(tryConnectionOf(news.cluster));
            if (oldCluster !== undefined &&
                newCluster !== undefined &&
                oldCluster !== newCluster) {
                return { action: "replace" };
            }
            if (oldCluster !== undefined &&
                (olds.namespace ?? "default") !== (news.namespace ?? "default")) {
                return { action: "replace" };
            }
            // Content drift (see Deployment).
            const connection = tryConnectionOf(news.cluster);
            if (output && connection) {
                const adapter = yield* findClusterAdapter(connection.auth.kind);
                const source = news;
                const hash = yield* workloadImageHash({
                    adapter,
                    source,
                    platform: imagePlatformOf(news.architecture),
                    isExternal: news.isExternal,
                    bootstrap: (adapter.bootstrap?.job ?? makeJobBootstrap)(source.handler ?? "default"),
                });
                if (hash !== undefined && hash !== output.code.hash) {
                    return { action: "update" };
                }
            }
        }),
        read: Effect.fn(function* ({ output }) {
            if (!output)
                return undefined;
            const connection = connectionOfOutput(output);
            if (!connection)
                return undefined;
            const transport = yield* connectCluster(connection).pipe(Effect.catchTag("Kubernetes.ClusterNotFoundError", () => Effect.succeed(undefined)), 
            // Transient unreachability must not read as "gone".
            Effect.catch(() => Effect.succeed("unreachable")));
            if (transport === undefined)
                return undefined;
            if (transport === "unreachable")
                return output;
            // The ServiceAccount is the stable existence anchor: one-shot Job
            // objects are content-addressed and may have been TTL-collected.
            const anchor = (output.kubernetesObjects ?? [])[0];
            if (!anchor)
                return output;
            const observed = yield* readObject({
                transport,
                object: anchor,
            }).pipe(Effect.catchIf(isNotFound, () => Effect.succeed(undefined)), Effect.catch(() => Effect.succeed(output)));
            if (observed === undefined)
                return undefined;
            return output;
        }),
        reconcile: Effect.fn(function* ({ id, news, bindings, output, session, }) {
            const connection = toConnection(news.cluster);
            const adapter = yield* findClusterAdapter(connection.auth.kind);
            const transport = yield* adapter.connect(connection);
            const namespace = news.namespace ?? "default";
            const baseName = yield* toBaseName(id, news);
            const serviceAccountName = output?.serviceAccountName ?? baseName;
            const tags = {
                ...(yield* createInternalTags(id)),
                ...news.tags,
            };
            const { env: bindingEnv, grantKeys } = collectBindingEnv(bindings);
            if (grantKeys.length > 0 && adapter.identity === undefined) {
                return yield* Effect.die(new Error(`'${id}': bindings carry cloud credential grants ` +
                    `(${grantKeys.join(", ")}) but this cluster's platform ` +
                    "has no workload-identity adapter. Target a managed " +
                    "cluster (e.g. AWS.EKS.Cluster) or bind through " +
                    "environment variables instead."));
            }
            const identity = adapter.identity
                ? yield* adapter.identity.reconcile({
                    id,
                    connection,
                    namespace,
                    serviceAccount: serviceAccountName,
                    bindings,
                    options: news.identity,
                    state: output?.identity ??
                        output,
                    tags,
                })
                : undefined;
            // Resolve the container image (`main` | `context` | `image`).
            const source = news;
            const resolved = yield* resolveWorkloadImage({
                adapter,
                id,
                source,
                platform: imagePlatformOf(news.architecture),
                isExternal: news.isExternal,
                bootstrap: (adapter.bootstrap?.job ?? makeJobBootstrap)(source.handler ?? "default"),
                tags,
                state: output?.registry ??
                    output,
                session,
            });
            // Synthesize the Kubernetes objects. The generated name label is
            // always present so selectors and Kueue-style extra labels
            // compose without erasing the workload's identity label.
            const labels = {
                "app.kubernetes.io/name": baseName,
                ...news.labels,
            };
            const containerEnv = {
                ...bindingEnv,
                ...identity?.env,
                ...alchemyEnv,
                ...news.env,
            };
            const serviceAccountObject = {
                apiVersion: "v1",
                kind: "ServiceAccount",
                metadata: {
                    name: serviceAccountName,
                    namespace,
                    labels,
                    ...(identity?.serviceAccountAnnotations
                        ? { annotations: identity.serviceAccountAnnotations }
                        : {}),
                },
            };
            const podTemplate = deepMerge({
                metadata: { labels },
                spec: {
                    serviceAccountName,
                    restartPolicy: news.restartPolicy ?? "Never",
                    containers: [
                        {
                            name: baseName,
                            image: resolved.imageUri,
                            command: news.command,
                            args: news.args,
                            env: Object.entries(containerEnv).map(([name, value]) => ({
                                name,
                                value: typeof value === "string"
                                    ? value
                                    : JSON.stringify(value),
                            })),
                            resources: news.resources,
                        },
                    ],
                },
            }, news.podTemplate);
            const jobSpec = {
                backoffLimit: news.backoffLimit,
                ttlSecondsAfterFinished: news.ttlSecondsAfterFinished,
                template: podTemplate,
            };
            const kind = news.schedule ? "CronJob" : "Job";
            // A Kubernetes Job's pod template is immutable after creation, so
            // one-shot Jobs are content-addressed: the object name embeds a
            // hash of the spec, and a spec change applies a NEW Job (which
            // runs) while `reconcileObjects` deletes the previous one.
            // CronJobs are mutable and keep the stable base name.
            // Kubernetes rejects Job names over 63 characters (the API
            // stamps the name into the batch.kubernetes.io/job-name pod
            // label, and label values cap at 63) — truncate the base so the
            // content-address suffix always fits.
            const jobName = news.schedule
                ? baseName.slice(0, 52).replace(/-+$/, "")
                : `${baseName.slice(0, 54).replace(/-+$/, "")}-${(yield* sha256Object(jobSpec)).slice(0, 8)}`;
            const workloadObject = news.schedule
                ? {
                    apiVersion: "batch/v1",
                    kind: "CronJob",
                    metadata: { name: jobName, namespace, labels },
                    spec: {
                        schedule: news.schedule,
                        jobTemplate: {
                            metadata: { labels },
                            spec: jobSpec,
                        },
                    },
                }
                : {
                    apiVersion: "batch/v1",
                    kind: "Job",
                    metadata: { name: jobName, namespace, labels },
                    spec: jobSpec,
                };
            const desiredObjects = [serviceAccountObject, workloadObject];
            const kubernetesObjects = yield* reconcileObjects({
                transport,
                previousObjects: output?.kubernetesObjects ?? [],
                desiredObjects,
            });
            yield* session.note(`Applied Kubernetes ${kind} ${namespace}/${jobName}`);
            return {
                connection,
                namespace,
                kind,
                jobName,
                schedule: news.schedule,
                serviceAccountName,
                imageUri: resolved.imageUri,
                identity: identity?.state,
                registry: resolved.state,
                kubernetesObjects,
                code: { hash: resolved.codeHash },
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            const connection = connectionOfOutput(output);
            if (!connection)
                return;
            const adapter = yield* findClusterAdapter(connection.auth.kind);
            // Delete the in-cluster objects; skip when the cluster is gone
            // (cluster-scoped state dies with it) and still clean up the
            // adapter-owned cloud resources that outlive it.
            const transport = yield* adapter
                .connect(connection)
                .pipe(Effect.catch(() => Effect.succeed(undefined)));
            if (transport && (output.kubernetesObjects ?? []).length > 0) {
                yield* deleteObjects({
                    transport,
                    objects: output.kubernetesObjects ?? [],
                }).pipe(Effect.catch(() => Effect.void));
            }
            if (adapter.identity) {
                yield* adapter.identity.delete({
                    connection,
                    state: output.identity ??
                        output,
                });
            }
            if (adapter.registry) {
                yield* adapter.registry.delete({
                    state: output.registry ??
                        output,
                });
            }
        }),
    };
}));
//# sourceMappingURL=Job.js.map