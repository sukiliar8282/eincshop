import * as codebuild from "@distilled.cloud/aws/codebuild";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { toWireMinutes } from "../../Util/Duration.js";
import { normalizePolicyDocument, stringifyPolicyDocument, } from "../IAM/Policy.js";
/**
 * An AWS CodeBuild build project — a reusable definition of how to run a
 * build: the source, the build container, the compute size, the IAM role,
 * and where artifacts land.
 *
 * The project is a definition only; creating it is instant and free.
 * Running a build (`StartBuild`) provisions compute and is billed per
 * build-minute.
 * ### Creating a Project
 * **Example:** NO_SOURCE Project with an Inline Buildspec
 * ```typescript
 * const project = yield* CodeBuild.Project("Hello", {
 *   serviceRole: role.roleArn,
 *   source: {
 *     type: "NO_SOURCE",
 *     buildspec: [
 *       "version: 0.2",
 *       "phases:",
 *       "  build:",
 *       "    commands:",
 *       "      - echo Hello from CodeBuild",
 *     ].join("\n"),
 *   },
 *   environment: {
 *     image: "aws/codebuild/amazonlinux2-x86_64-standard:5.0",
 *     computeType: "BUILD_GENERAL1_SMALL",
 *   },
 * });
 * ```
 *
 * **Example:** S3-Source Project with S3 Artifacts
 * ```typescript
 * const project = yield* CodeBuild.Project("Packager", {
 *   serviceRole: role.roleArn,
 *   source: { type: "S3", location: `${bucket.bucketName}/source.zip` },
 *   artifacts: { type: "S3", location: bucket.bucketName, name: "out.zip", packaging: "ZIP" },
 *   environment: {
 *     image: "aws/codebuild/amazonlinux2-x86_64-standard:5.0",
 *     environmentVariables: [{ name: "STAGE", value: "prod" }],
 *   },
 * });
 * ```
 *
 * @resource
 */
export const Project = Resource("AWS.CodeBuild.Project");
/** Convert a CodeBuild wire tag list into a plain record. */
const toTagRecord = (tags) => Object.fromEntries((tags ?? [])
    .filter((tag) => typeof tag.key === "string" && typeof tag.value === "string")
    .map((tag) => [tag.key, tag.value]));
const toWireTags = (tags) => Object.entries(tags).map(([key, value]) => ({ key, value }));
const toWireSource = (source) => ({
    type: source.type,
    location: source.location,
    buildspec: source.buildspec,
    gitCloneDepth: source.gitCloneDepth,
    reportBuildStatus: source.reportBuildStatus,
    insecureSsl: source.insecureSsl,
});
const toWireArtifacts = (artifacts) => ({
    type: artifacts?.type ?? "NO_ARTIFACTS",
    location: artifacts?.location,
    path: artifacts?.path,
    namespaceType: artifacts?.namespaceType,
    name: artifacts?.name,
    packaging: artifacts?.packaging,
    overrideArtifactName: artifacts?.overrideArtifactName,
    encryptionDisabled: artifacts?.encryptionDisabled,
});
const toWireEnvironment = (environment) => ({
    type: environment.type ?? "LINUX_CONTAINER",
    image: environment.image,
    computeType: environment.computeType ?? "BUILD_GENERAL1_SMALL",
    environmentVariables: environment.environmentVariables?.map((v) => ({
        name: v.name,
        value: v.value,
        type: v.type,
    })),
    privilegedMode: environment.privilegedMode,
    certificate: environment.certificate,
    imagePullCredentialsType: environment.imagePullCredentialsType,
});
/**
 * CodeBuild validates the service role at create/update time; a freshly
 * created IAM role is not yet assumable, surfacing as an
 * `InvalidInputException` whose message mentions the role is not authorized.
 * Retry (bounded) through IAM propagation. The explicit return annotation
 * keeps the retry's conditional type out of declaration emit (which would
 * otherwise widen the provider layer — see PATTERNS §7).
 */
const retryIamPropagation = (effect) => effect.pipe(Effect.retry({
    while: (e) => e._tag === "InvalidInputException" &&
        (e.message ?? "").toLowerCase().includes("not authorized"),
    schedule: Schedule.max([
        Schedule.fixed("3 seconds"),
        Schedule.recurs(10),
    ]),
}));
export const ProjectProvider = () => Provider.effect(Project, Effect.gen(function* () {
    const toName = (id, props) => props.projectName
        ? Effect.succeed(props.projectName)
        : createPhysicalName({ id, maxLength: 128 });
    /** Read a project by name; a missing project reads as absent. */
    const getProject = Effect.fn(function* (name) {
        const response = yield* codebuild.batchGetProjects({ names: [name] });
        return response.projects?.[0];
    });
    return {
        stables: ["projectName", "projectArn"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            if ((yield* toName(id, olds ?? {})) !== (yield* toName(id, news ?? {}))) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.projectName ?? (yield* toName(id, olds ?? {}));
            const project = yield* getProject(name);
            if (project === undefined || project.arn === undefined) {
                return undefined;
            }
            const attrs = {
                projectName: project.name ?? name,
                projectArn: project.arn,
            };
            const tags = toTagRecord(project.tags);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.projectName ?? (yield* toName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // 1. Observe — cloud state is authoritative.
            let observed = yield* getProject(name);
            const spec = {
                description: news.description,
                source: toWireSource(news.source),
                artifacts: toWireArtifacts(news.artifacts),
                environment: toWireEnvironment(news.environment),
                serviceRole: news.serviceRole,
                // The CodeBuild wire unit for build/queue timeouts is whole minutes.
                timeoutInMinutes: toWireMinutes(news.timeout),
                queuedTimeoutInMinutes: toWireMinutes(news.queuedTimeout),
                concurrentBuildLimit: news.concurrentBuildLimit,
                encryptionKey: news.encryptionKey,
                badgeEnabled: news.badgeEnabled,
                logsConfig: news.logsConfig,
                tags: toWireTags(desiredTags),
            };
            // 3. Sync — updateProject is a full upsert of the definition and
            // tags; apply the desired spec (project updates are instant). A
            // delete→redeploy race can leave batchGetProjects returning the
            // just-deleted project; updateProject then reports the truth with
            // a typed ResourceNotFoundException — treat it as missing.
            if (observed !== undefined) {
                observed = yield* retryIamPropagation(codebuild.updateProject({ name, ...spec })).pipe(Effect.map((updated) => updated.project), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            }
            // 2. Ensure — create if missing; tolerate the create/create race.
            if (observed === undefined) {
                const created = yield* retryIamPropagation(codebuild.createProject({ name, ...spec })).pipe(Effect.catchTag("ResourceAlreadyExistsException", () => getProject(name).pipe(Effect.map((p) => ({ project: p })))));
                observed = created.project;
            }
            if (observed === undefined || observed.arn === undefined) {
                return yield* Effect.fail(new Error(`CodeBuild project '${name}' disappeared while reconciling`));
            }
            // 3b. Sync — resource policy. Compare observed against desired in
            // normalized form (keys sorted, no whitespace) so a re-deploy of an
            // equivalent document — regardless of key order or string vs typed
            // object — is a no-op that skips the API entirely.
            const desiredPolicy = news.resourcePolicy === undefined
                ? undefined
                : typeof news.resourcePolicy === "string"
                    ? news.resourcePolicy
                    : stringifyPolicyDocument(news.resourcePolicy);
            const observedPolicy = yield* codebuild
                .getResourcePolicy({ resourceArn: observed.arn })
                .pipe(Effect.map((res) => res.policy), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            if (desiredPolicy === undefined) {
                if (observedPolicy !== undefined && observedPolicy !== "") {
                    yield* codebuild.deleteResourcePolicy({
                        resourceArn: observed.arn,
                    });
                }
            }
            else if (observedPolicy === undefined ||
                normalizePolicyDocument(observedPolicy) !==
                    normalizePolicyDocument(desiredPolicy)) {
                yield* codebuild.putResourcePolicy({
                    resourceArn: observed.arn,
                    policy: desiredPolicy,
                });
            }
            // 4. Return fresh attributes.
            yield* session.note(name);
            return {
                projectName: observed.name ?? name,
                projectArn: observed.arn,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            // deleteProject is idempotent — a missing project returns success.
            yield* codebuild.deleteProject({ name: output.projectName });
        }),
        list: () => codebuild.listProjects.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.projects ?? [])), Effect.flatMap((names) => names.length === 0
            ? Effect.succeed([])
            : Effect.forEach(
            // batchGetProjects accepts up to 100 names per call.
            chunkNames(names, 100), (batch) => codebuild
                .batchGetProjects({ names: batch })
                .pipe(Effect.map((res) => res.projects ?? [])), { concurrency: 2 }).pipe(Effect.map((results) => results
                .flat()
                .flatMap((p) => p.name !== undefined && p.arn !== undefined
                ? [{ projectName: p.name, projectArn: p.arn }]
                : []))))),
    };
}));
/** Split a list into fixed-size chunks. */
const chunkNames = (names, size) => {
    const chunks = [];
    for (let i = 0; i < names.length; i += size) {
        chunks.push(names.slice(i, i + size));
    }
    return chunks;
};
//# sourceMappingURL=Project.js.map