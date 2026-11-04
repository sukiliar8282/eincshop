import * as microvms from "@distilled.cloud/aws/lambda-microvms";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as Redacted from "effect/Redacted";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import * as Artifacts from "../../Artifacts.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { createInternalTags, diffTags } from "../../Tags.js";
import { sha256 } from "../../Util/sha256.js";
import { Assets } from "../Assets.js";
import { buildMicrovmDockerfile, bundleMicrovmProgram, DEFAULT_MICROVM_PORT, readContextDirectory, zipFiles, } from "./MicrovmBundle.js";
import { MicrovmImage } from "./MicrovmImage.js";
// Fold the `env` map (user-provided + capability-binding contributions) into the
// MicroVM API's `environmentVariables` (a `Record<string, string>`). Redacted
// values are unwrapped; non-string values are JSON-encoded.
const foldEnv = (env) => {
    if (!env)
        return undefined;
    const out = {};
    for (const [key, value] of Object.entries(env)) {
        if (value === undefined)
            continue;
        const v = Redacted.isRedacted(value) ? Redacted.value(value) : value;
        out[key] = typeof v === "string" ? v : JSON.stringify(v);
    }
    return Object.keys(out).length > 0 ? out : undefined;
};
const READY_STATES = new Set(["CREATED", "UPDATED"]);
const FAILED_STATES = new Set([
    "CREATE_FAILED",
    "UPDATE_FAILED",
    "DELETE_FAILED",
]);
const toIso = (value) => value instanceof Date ? value.toISOString() : value;
// Resolve `buildRole` / `baseImage` (each a string ARN or a materialized
// resource reference) to a plain ARN string. The engine materializes a
// whole-resource prop into its stable attributes (see Plan.ts `resolveInput`),
// so the instance's `.roleArn` / `.imageArn` is a plain string at reconcile.
const resolveBuildRoleArn = (news) => news.buildRole === undefined
    ? undefined
    : typeof news.buildRole === "string"
        ? news.buildRole
        : news.buildRole.roleArn;
const resolveBaseImageArn = (news) => news.baseImage === undefined
    ? undefined
    : typeof news.baseImage === "string"
        ? news.baseImage
        : news.baseImage.imageArn;
// Properties (besides the artifact content) that affect the built image.
const buildPropsIdentity = (news) => JSON.stringify({
    baseImageArn: resolveBaseImageArn(news) ?? null,
    baseImageVersion: news.baseImageVersion ?? null,
    description: news.description ?? null,
    logging: news.logging ?? null,
    egressNetworkConnectors: [...(news.egressNetworkConnectors ?? [])].sort(),
    cpuConfigurations: news.cpuConfigurations ?? [],
    resources: news.resources ?? [],
    additionalOsCapabilities: [...(news.additionalOsCapabilities ?? [])].sort(),
    hooks: news.hooks ?? null,
    env: news.env ?? {},
});
/**
 * Pick the content inputs off the plan-time props, or `undefined` when they
 * cannot be read yet. At plan time the props may be unresolved — the build
 * role, env, … are Outputs, and the whole object may itself be an
 * Output/Effect/Config — so only a plain object whose content inputs have
 * all resolved qualifies.
 */
const resolvedContentInputs = (news) => {
    if (typeof news !== "object" || news === null)
        return undefined;
    const n = news;
    const picked = {
        main: n.main,
        context: n.context,
        codeArtifact: n.codeArtifact,
        runtime: n.runtime,
        port: n.port,
        dockerfile: n.dockerfile,
        isExternal: n.isExternal,
        external: n.external,
        build: n.build,
    };
    if (!isResolved(picked))
        return undefined;
    // `isResolved` has verified every field; the cast only re-states that
    // for a type the guard cannot express on a mapped `Input<…>` object.
    const resolved = picked;
    // An Effect/Config-shaped props object has none of these set.
    if (!resolved.main && !resolved.context && !resolved.codeArtifact?.uri) {
        return undefined;
    }
    return resolved;
};
const resolveName = (id, name) => name
    ? Effect.succeed(name)
    : createPhysicalName({ id, maxLength: 64, delimiter: "-" });
// `getMicrovmImage` requires an ARN or ID — it rejects a plain name with a
// `ValidationException` ("Invalid ARN format"). Only call it with an
// ARN/ID.
const getImage = (identifier) => microvms
    .getMicrovmImage({ imageIdentifier: identifier })
    .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
// Look an image up by its (name-only) identifier via the name filter, since
// `getMicrovmImage` won't accept a name. Returns the full image or undefined.
const findImageByName = Effect.fn(function* (name) {
    const summaries = yield* microvms.listMicrovmImages
        .items({ nameFilter: name })
        .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)));
    const match = summaries.find((summary) => summary.name === name);
    return match ? yield* getImage(match.imageArn) : undefined;
});
const defaultBaseImageArn = Effect.fn(function* () {
    const items = yield* microvms.listManagedMicrovmImages.items({}).pipe(Stream.runCollect, Effect.map((c) => Array.from(c)));
    const base = items.find((i) => i.imageArn.includes("al2023")) ?? items[0];
    if (!base) {
        return yield* Effect.die("No managed MicroVM base images available; set `baseImage`.");
    }
    return base.imageArn;
});
/**
 * Bundle (or package) the image's code and hash the result. Nothing is
 * uploaded here and no prop outside {@link contentInputs} is read: `diff`
 * calls this before the props have resolved (the build role is an Output
 * at plan time) to see a content-only edit of the in-VM program, and
 * `reconcile` calls it again for the archive to upload. Memoized per
 * resource for the run so a diff→reconcile cycle bundles once.
 */
const artifactContent = (id, news, note) => Effect.gen(function* () {
    if (news.main) {
        const runtime = news.runtime ?? "node";
        const port = news.port ?? DEFAULT_MICROVM_PORT;
        yield* note("Bundling MicroVM program...");
        const { files, hash: bundleHash } = yield* bundleMicrovmProgram({
            main: news.main,
            runtime,
            isExternal: news.isExternal ?? false,
            external: news.external,
            port,
            build: news.build,
        });
        const dockerfile = buildMicrovmDockerfile(news.dockerfile, runtime, port);
        const identity = `${bundleHash}:${dockerfile}`;
        const contentHash = yield* sha256(identity);
        const archive = yield* zipFiles([
            { path: "Dockerfile", content: dockerfile },
            ...files,
        ]);
        return { contentHash, identity, archive };
    }
    if (news.context) {
        const path = yield* Path.Path;
        const fs = yield* FileSystem.FileSystem;
        yield* note("Packaging MicroVM build context...");
        const files = yield* readContextDirectory(news.context);
        // Ensure a Dockerfile is present (resolve from `dockerfile` path or default).
        const dockerfileName = news.dockerfile ?? "Dockerfile";
        const hasDockerfile = files.some((f) => f.path === dockerfileName);
        if (!hasDockerfile) {
            const dockerfilePath = path.join(news.context, dockerfileName);
            const content = yield* fs
                .readFile(dockerfilePath)
                .pipe(Effect.catch(() => Effect.succeed(undefined)));
            if (content)
                files.push({ path: "Dockerfile", content });
        }
        // Hash the BYTES, not `path:byteLength` — a same-length edit (a
        // flipped version string, a swapped constant) must count as a change.
        const contentId = (yield* Effect.forEach([...files].sort((a, b) => (a.path < b.path ? -1 : 1)), (f) => Effect.map(sha256(f.content), (hash) => `${f.path}:${hash}`))).join("|");
        const archive = yield* zipFiles(files);
        return {
            contentHash: yield* sha256(contentId),
            identity: contentId,
            archive,
        };
    }
    if (news.codeArtifact?.uri) {
        const uri = news.codeArtifact.uri;
        return { contentHash: yield* sha256(uri), identity: uri, uri };
    }
    return yield* Effect.die("MicrovmImage requires one of `main`, `context`, or `codeArtifact.uri`.");
}).pipe(Artifacts.cached(`microvm-image-content:${id}`));
// Materialize + upload the code artifact and compute its build identity hash
// (content + props). The `hash` formulas are unchanged from before
// `contentHash` existed, so images deployed earlier are not rebuilt once.
const resolveArtifact = Effect.fn(function* (id, news, session) {
    const propsId = buildPropsIdentity(news);
    const content = yield* artifactContent(id, news, session.note);
    const hash = yield* sha256(`${content.identity}:${propsId}`);
    if ("uri" in content) {
        return {
            uri: content.uri,
            hash,
            contentHash: content.contentHash,
        };
    }
    const assets = yield* Assets;
    const key = yield* assets.uploadAsset(hash, content.archive);
    const bucket = yield* assets.bucketName;
    return {
        uri: `s3://${bucket}/${key}`,
        hash,
        contentHash: content.contentHash,
    };
});
const toAttrs = (image, artifact) => ({
    imageArn: image.imageArn,
    name: image.name,
    state: image.state,
    imageVersion: image.latestActiveImageVersion ?? image.latestFailedImageVersion,
    latestActiveImageVersion: image.latestActiveImageVersion,
    latestFailedImageVersion: image.latestFailedImageVersion,
    createdAt: toIso(image.createdAt),
    updatedAt: toIso(image.updatedAt),
    codeArtifact: artifact
        ? {
            uri: artifact.uri,
            hash: artifact.hash,
            contentHash: artifact.contentHash,
        }
        : undefined,
});
const requireBuildRole = (news) => {
    const arn = resolveBuildRoleArn(news);
    return arn
        ? Effect.succeed(arn)
        : Effect.die("MicrovmImage requires `buildRole` to build the image.");
};
const createImage = Effect.fn(function* (name, news, artifact, baseImageArn, desiredTags, session) {
    const buildRoleArn = yield* requireBuildRole(news);
    yield* session.note(`Creating MicroVM image ${name}...`);
    const created = yield* microvms
        .createMicrovmImage({
        name,
        baseImageArn,
        baseImageVersion: news.baseImageVersion,
        buildRoleArn,
        codeArtifact: { uri: artifact.uri },
        description: news.description,
        logging: news.logging,
        egressNetworkConnectors: news.egressNetworkConnectors,
        cpuConfigurations: news.cpuConfigurations,
        resources: news.resources,
        additionalOsCapabilities: news.additionalOsCapabilities,
        hooks: news.hooks,
        environmentVariables: foldEnv(news.env),
        tags: desiredTags,
    })
        .pipe(Effect.catchTag("ConflictException", () => getImage(name).pipe(Effect.flatMap((existing) => existing
        ? Effect.succeed({ imageArn: existing.imageArn })
        : Effect.die(`MicroVM image ${name} conflicted but was not found.`)))));
    return yield* waitForReady(created.imageArn, session);
});
const updateImage = Effect.fn(function* (imageArn, news, artifact, baseImageArn, session) {
    const buildRoleArn = yield* requireBuildRole(news);
    yield* session.note(`Updating MicroVM image ${news.name ?? imageArn}...`);
    const updated = yield* microvms.updateMicrovmImage({
        imageIdentifier: imageArn,
        baseImageArn,
        baseImageVersion: news.baseImageVersion,
        buildRoleArn,
        codeArtifact: { uri: artifact.uri },
        description: news.description,
        logging: news.logging,
        egressNetworkConnectors: news.egressNetworkConnectors,
        cpuConfigurations: news.cpuConfigurations,
        resources: news.resources,
        additionalOsCapabilities: news.additionalOsCapabilities,
        hooks: news.hooks,
        environmentVariables: foldEnv(news.env),
    });
    return yield* waitForReady(updated.imageArn, session);
});
const syncTags = Effect.fn(function* (imageArn, observedTags, desiredTags) {
    const { removed, upsert } = diffTags(observedTags, desiredTags);
    if (removed.length > 0) {
        yield* microvms.untagResource({ Resource: imageArn, TagKeys: removed });
    }
    if (upsert.length > 0) {
        yield* microvms.tagResource({
            Resource: imageArn,
            Tags: Object.fromEntries(upsert.map((t) => [t.Key, t.Value])),
        });
    }
});
export const MicrovmImageProvider = () => Provider.succeed(MicrovmImage, {
    stables: ["imageArn", "name"],
    diff: Effect.fn(function* ({ id, olds, news, output }) {
        // A content-only edit of the in-VM program changes none of the props,
        // so the engine's structural diff would call it a noop and the image
        // would never rebuild. Bundle (memoized for the run) and compare the
        // CONTENT hash, exactly as the Lambda Function diff does. This runs
        // before the props resolve — the build role is an Output at plan
        // time — which is fine because only the plain content inputs are
        // read. Rows persisted before `contentHash` existed skip the check
        // until their next reconcile stamps it.
        const previousContentHash = output?.codeArtifact?.contentHash;
        const content = resolvedContentInputs(news);
        if (previousContentHash !== undefined && content !== undefined) {
            const { contentHash } = yield* artifactContent(id, content, () => Effect.void);
            if (contentHash !== previousContentHash) {
                return { action: "update" };
            }
        }
        if (!isResolved(news))
            return;
        const oldName = yield* resolveName(id, olds.name);
        const newName = yield* resolveName(id, news.name);
        if (oldName !== newName) {
            return { action: "replace" };
        }
    }),
    read: Effect.fn(function* ({ id, olds, output }) {
        // Prefer the cached ARN; otherwise look up by name (getMicrovmImage
        // rejects names).
        const image = output?.imageArn
            ? yield* getImage(output.imageArn)
            : yield* findImageByName(output?.name ?? (yield* resolveName(id, olds?.name)));
        return image
            ? toAttrs(image, output?.codeArtifact)
            : undefined;
    }),
    list: () => Effect.gen(function* () {
        const summaries = yield* microvms.listMicrovmImages.items({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)));
        const images = yield* Effect.forEach(summaries, (summary) => getImage(summary.imageArn), { concurrency: 10 });
        return images.flatMap((image) => (image ? [toAttrs(image)] : []));
    }),
    reconcile: Effect.fn(function* ({ id, news, output, session }) {
        const name = yield* resolveName(id, news.name);
        const internalTags = yield* createInternalTags(id);
        const desiredTags = { ...internalTags, ...news.tags };
        const baseImageArn = resolveBaseImageArn(news) ?? (yield* defaultBaseImageArn());
        // Resolve + upload the artifact and compute its build identity.
        const artifact = yield* resolveArtifact(id, news, session);
        // Observe — prefer the cached ARN; otherwise look up by name (a name
        // is not a valid `getMicrovmImage` identifier).
        const observed = output?.imageArn
            ? yield* getImage(output.imageArn)
            : yield* findImageByName(name);
        // Ensure + sync: rebuild only when the build identity changed.
        const image = !observed
            ? yield* createImage(name, news, artifact, baseImageArn, desiredTags, session)
            : output?.codeArtifact?.hash === artifact.hash
                ? observed
                : yield* updateImage(observed.imageArn, news, artifact, baseImageArn, session);
        yield* syncTags(image.imageArn, (image.tags ?? {}), desiredTags);
        yield* session.note(`MicroVM image ${name} is ${image.state}`);
        return toAttrs(image, artifact);
    }),
    delete: Effect.fn(function* ({ output, session }) {
        // An image can't be deleted while it still has MicroVMs running — tear
        // them down first and wait for them to disappear.
        yield* terminateRunningMicrovms(output.imageArn, session);
        yield* session.note(`Deleting MicroVM image ${output.name}...`);
        yield* microvms
            .deleteMicrovmImage({ imageIdentifier: output.imageArn })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void), 
        // A MicroVM caught mid-termination still blocks the delete; retry
        // briefly until the instances are fully gone.
        Effect.retry({
            while: (e) => e._tag === "ValidationException" &&
                e.message.includes("running MicroVMs"),
            schedule: Schedule.max([
                Schedule.fixed(5_000),
                Schedule.recurs(12),
            ]),
        }));
        yield* waitForDeleted(output.imageArn, session);
    }),
});
class ImageBuilding extends Data.TaggedError("ImageBuilding") {
}
class ImageFailed extends Data.TaggedError("ImageFailed") {
}
class MicrovmsActive extends Data.TaggedError("MicrovmsActive") {
}
// MicroVM states that still hold a slot on the image and block its deletion.
const ACTIVE_MICROVM_STATES = new Set([
    "PENDING",
    "RUNNING",
    "SUSPENDING",
    "SUSPENDED",
]);
const listActiveMicrovms = (imageArn) => microvms.listMicrovms.items({ imageIdentifier: imageArn }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).filter((m) => ACTIVE_MICROVM_STATES.has(m.state))), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed([])));
// Terminate every running MicroVM launched from this image and wait until none
// remain active — a prerequisite for deleting the image.
const terminateRunningMicrovms = Effect.fn(function* (imageArn, session) {
    const active = yield* listActiveMicrovms(imageArn);
    if (active.length === 0)
        return;
    yield* session.note(`Terminating ${active.length} running MicroVM(s)...`);
    yield* Effect.forEach(active, (m) => microvms.terminateMicrovm({ microvmIdentifier: m.microvmId }).pipe(
    // Already gone or mid-transition — the wait below converges anyway.
    Effect.catchTag([
        "ResourceNotFoundException",
        "ConflictException",
        "ValidationException",
    ], () => Effect.void)), { concurrency: 5, discard: true });
    yield* listActiveMicrovms(imageArn).pipe(Effect.flatMap((remaining) => remaining.length === 0
        ? Effect.void
        : new MicrovmsActive({ count: remaining.length })), Effect.retry({
        while: (e) => e._tag === "MicrovmsActive",
        schedule: Schedule.max([Schedule.fixed(5_000), Schedule.recurs(24)]).pipe(Schedule.tap(() => session.note("Waiting for MicroVMs to terminate..."))),
    }));
});
// Drill into the failed version's `stateReason` (and per-architecture build
// state reasons) so a build failure surfaces an actionable message instead of
// just `CREATE_FAILED`.
const buildFailureReason = Effect.fn(function* (imageArn, imageVersion) {
    if (!imageVersion)
        return undefined;
    const version = yield* microvms
        .getMicrovmImageVersion({ imageIdentifier: imageArn, imageVersion })
        .pipe(Effect.catch(() => Effect.succeed(undefined)));
    // A version fans out to one build per architecture/chipset; report the reason
    // from each build that actually FAILED (keyed by architecture so multi-platform
    // failures are distinguishable). `buildState` is the reliable signal — don't
    // guess via timestamps.
    const builds = yield* microvms.listMicrovmImageBuilds
        .items({ imageIdentifier: imageArn, imageVersion })
        .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)), Effect.catch(() => Effect.succeed([])));
    const failedBuildReasons = builds
        .filter((b) => b.buildState === "FAILED" && b.stateReason)
        .map((b) => `${b.architecture}: ${b.stateReason}`);
    // Prefer the per-build failure reasons; fall back to the version-level reason.
    const reasons = failedBuildReasons.length > 0
        ? [...new Set(failedBuildReasons)]
        : [version?.stateReason].filter((r) => !!r);
    return reasons.join("; ");
});
const waitForReady = (imageArn, session) => Effect.gen(function* () {
    const image = yield* microvms.getMicrovmImage({
        imageIdentifier: imageArn,
    });
    if (READY_STATES.has(image.state))
        return image;
    if (FAILED_STATES.has(image.state)) {
        const reason = yield* buildFailureReason(imageArn, image.latestFailedImageVersion);
        yield* session.note(`MicroVM image build ${image.state}: ${reason ?? "(no reason reported)"}`);
        yield* Effect.logError(`MicroVM image ${imageArn} build ${image.state}: ${reason ?? "(no reason reported)"}`);
        return yield* new ImageFailed({ imageArn, state: image.state, reason });
    }
    return yield* new ImageBuilding({ imageArn, state: image.state });
}).pipe(Effect.retry({
    while: (e) => e._tag === "ImageBuilding",
    schedule: Schedule.max([
        Schedule.fixed(10_000),
        Schedule.recurs(72),
    ]).pipe(Schedule.tap(({ attempt }) => session.note(`Waiting for MicroVM image build... (${attempt * 10}s)`))),
}));
const waitForDeleted = (imageArn, session) => Effect.gen(function* () {
    const image = yield* microvms
        .getMicrovmImage({ imageIdentifier: imageArn })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    if (!image || image.state === "DELETED")
        return;
    if (image.state === "DELETE_FAILED") {
        return yield* new ImageFailed({ imageArn, state: image.state });
    }
    return yield* new ImageBuilding({ imageArn, state: image.state });
}).pipe(Effect.retry({
    while: (e) => e._tag === "ImageBuilding",
    schedule: Schedule.max([
        Schedule.fixed(10_000),
        Schedule.recurs(72),
    ]).pipe(Schedule.tap(({ attempt }) => session.note(`Waiting for MicroVM image deletion... (${attempt * 10}s)`))),
}));
//# sourceMappingURL=MicrovmProvider.js.map