import * as logpush from "@distilled.cloud/cloudflare/logpush";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { listAllZones } from "../Zone/lookup.js";
const TypeId = "Cloudflare.Logpush.Job";
/**
 * A Cloudflare Logpush job that pushes batches of logs (HTTP requests,
 * Workers trace events, audit logs, Zero Trust datasets, …) to a
 * destination such as R2, S3, GCS, or an HTTP endpoint.
 *
 * Jobs can be account-scoped (default) or zone-scoped (pass `zoneId`).
 * The dataset, kind, and scope are fixed at creation — changing any of
 * them triggers a replacement; everything else updates in place.
 * ### Pushing Workers trace events to R2
 * **Example:** Account-scoped job writing to an R2 bucket
 * The R2 destination authenticates with S3-compatible credentials embedded
 * in the destination URI, so no ownership challenge is required.
 * ```typescript
 * const bucket = yield* Cloudflare.R2.Bucket("logs", {});
 *
 * const job = yield* Cloudflare.Logpush.Job("worker-logs", {
 *   dataset: "workers_trace_events",
 *   destinationConf: Output.interpolate`r2://${bucket.bucketName}/{DATE}?account-id=${accountId}&access-key-id=${r2AccessKeyId}&secret-access-key=${r2SecretAccessKey}`,
 *   enabled: true,
 * });
 * ```
 *
 * ### Zone-scoped jobs
 * **Example:** HTTP requests dataset on a zone (Enterprise)
 * ```typescript
 * const job = yield* Cloudflare.Logpush.Job("http-logs", {
 *   zoneId: zone.zoneId,
 *   dataset: "http_requests",
 *   destinationConf: "s3://my-bucket/logs?region=us-east-1",
 *   ownershipChallenge: "00000000000000000000",
 * });
 * ```
 *
 * ### Output configuration
 * **Example:** Selecting fields and batching limits
 * ```typescript
 * const job = yield* Cloudflare.Logpush.Job("worker-logs", {
 *   dataset: "workers_trace_events",
 *   destinationConf,
 *   outputOptions: {
 *     fieldNames: ["EventTimestampMs", "Outcome", "ScriptName"],
 *     outputType: "ndjson",
 *     timestampFormat: "rfc3339",
 *   },
 *   maxUploadIntervalSeconds: 60,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/logs/logpush/
 *
 * @resource
 * @product Logpush
 * @category Observability & Analytics
 */
export const Job = Resource(TypeId);
/**
 * Returns true if the given value is a Job resource.
 */
export const isJob = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const JobProvider = () => Provider.succeed(Job, {
    stables: ["jobId", "accountId", "zoneId", "dataset", "kind"],
    diff: Effect.fn(function* ({ olds = {}, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const o = olds;
        const n = news;
        if ((output?.accountId ?? accountId) !== accountId) {
            return { action: "replace" };
        }
        if (o.dataset !== undefined && o.dataset !== n.dataset) {
            return { action: "replace" };
        }
        if (o.dataset !== undefined && (o.kind ?? "") !== (n.kind ?? "")) {
            return { action: "replace" };
        }
        // zoneId is string; only comparable when both sides are
        // concrete strings (or one side is absent => scope change).
        const oZone = typeof o.zoneId === "string" ? o.zoneId : undefined;
        const nZone = typeof n.zoneId === "string" ? n.zoneId : undefined;
        if (o.dataset !== undefined &&
            (typeof o.zoneId === "string" || o.zoneId === undefined) &&
            (typeof n.zoneId === "string" || n.zoneId === undefined) &&
            oZone !== nZone) {
            return { action: "replace" };
        }
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const scope = {
            accountId: output?.accountId ?? accountId,
            zoneId: output?.zoneId ?? olds?.zoneId,
        };
        // Owned path: refresh by the persisted job id.
        if (output?.jobId !== undefined) {
            const observed = yield* observeById(scope, output.jobId);
            const attrs = toAttributes(observed, scope);
            if (attrs)
                return attrs;
        }
        // Cold/adoption path: no persisted id — find the job by name. The
        // engine-generated physical name embeds the instance id, so a match
        // on a generated name is proof we created it. A match on a
        // user-provided name is not — report it `Unowned` so the engine
        // gates takeover behind the adopt policy.
        const name = yield* createJobName(id, olds?.name);
        const match = yield* findByName(scope, name, olds?.dataset);
        const attrs = toAttributes(match, scope);
        if (attrs) {
            return olds?.name !== undefined ? Unowned(attrs) : attrs;
        }
        return undefined;
    }),
    // Logpush jobs are hybrid-scoped: account-scoped jobs live under the
    // account, zone-scoped jobs under each zone. Enumerate both — the account
    // collection plus a fan-out over every zone — and hydrate each into the
    // same Attributes shape `read` returns.
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const accountRows = yield* logpush.listJobsForAccount
            .pages({ accountId })
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? [])
            .filter((job) => job != null)
            .map((job) => toAttributes(job, { accountId, zoneId: undefined }))
            .filter((attrs) => attrs !== undefined))));
        const zones = yield* listAllZones(accountId);
        const zoneRows = yield* Effect.forEach(zones, (zone) => logpush.listJobsForZone.pages({ zoneId: zone.id }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? [])
            .filter((job) => job != null)
            .map((job) => toAttributes(job, { accountId, zoneId: zone.id }))
            .filter((attrs) => attrs !== undefined))), 
        // Best-effort account-wide fan-out: a zone the token can't read
        // for Logpush (plan-gated route, missing permission, or a code-
        // 10000 auth blip) must be skipped, not fail the whole
        // enumeration. Drop only that zone and keep the rest.
        Effect.catchTag(["InvalidRoute", "Unauthorized", "Forbidden", "NotFound"], () => Effect.succeed([]))), { concurrency: 10 });
        return [...accountRows, ...zoneRows.flat()];
    }),
    reconcile: Effect.fn(function* ({ id, news, olds, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const scope = {
            accountId: output?.accountId ?? accountId,
            zoneId: news.zoneId ?? undefined,
        };
        const name = yield* createJobName(id, news.name);
        const destinationConf = news.destinationConf;
        const body = buildMutableBody(news, name, destinationConf);
        // 1. Observe — by cached id first, falling back to a list scan by
        //    name so we recover from lost state or out-of-band deletes.
        let observed;
        if (output?.jobId !== undefined) {
            observed = yield* observeById(scope, output.jobId);
        }
        let justCreated = false;
        if (!observed) {
            observed = yield* findByName(scope, name, news.dataset);
        }
        // 2. Ensure — create when missing. Logpush job names are not
        //    unique, so there is no AlreadyExists race to tolerate; create
        //    failures are real (e.g. invalid destination).
        if (!observed) {
            observed = yield* createJob(scope, news.dataset, body);
            justCreated = true;
        }
        const jobId = observed.id;
        if (jobId === undefined || jobId === null) {
            return yield* Effect.fail(new Error("Cloudflare did not return an id for the Logpush job"));
        }
        // 3. Sync — Cloudflare's update endpoint is PUT-style; resend the
        //    full desired body when anything differs. `destination_conf`
        //    and `filter` are compared against `olds` because Cloudflare
        //    redacts embedded secrets (destination) or omits the field
        //    entirely (filter) in get/list responses.
        if (!justCreated && needsUpdate(body, news, olds, observed)) {
            observed = yield* updateJob(scope, jobId, body);
        }
        const attrs = toAttributes({ ...observed, id: jobId }, scope);
        if (!attrs) {
            return yield* Effect.fail(new Error("Cloudflare returned a Logpush job without id/dataset/destination"));
        }
        // Prefer the desired destination — the observed echo redacts secrets.
        return { ...attrs, destinationConf, name: attrs.name || name };
    }),
    delete: Effect.fn(function* ({ output }) {
        const scope = {
            accountId: output.accountId,
            zoneId: output.zoneId,
        };
        yield* (scope.zoneId !== undefined
            ? logpush.deleteJobForZone({
                zoneId: scope.zoneId,
                jobId: output.jobId,
            })
            : logpush.deleteJobForAccount({
                accountId: scope.accountId,
                jobId: output.jobId,
            })).pipe(Effect.catchTag("JobNotFound", () => Effect.void));
    }),
});
const createJobName = (id, name) => Effect.gen(function* () {
    if (name)
        return name;
    return yield* createPhysicalName({ id, lowercase: true });
});
const observeById = (scope, jobId) => (scope.zoneId !== undefined
    ? logpush.getJobForZone({ zoneId: scope.zoneId, jobId })
    : logpush.getJobForAccount({ accountId: scope.accountId, jobId })).pipe(Effect.map((job) => job), Effect.catchTag("JobNotFound", () => Effect.succeed(undefined)));
const findByName = (scope, name, dataset) => (scope.zoneId !== undefined
    ? logpush.listJobsForZone.items({ zoneId: scope.zoneId })
    : logpush.listJobsForAccount.items({ accountId: scope.accountId })).pipe(Stream.runCollect, Effect.map((chunk) => {
    const match = Array.from(chunk)
        .filter((job) => job != null)
        .find((job) => job.name === name &&
        (dataset === undefined || job.dataset === dataset));
    return match ?? undefined;
}));
const buildMutableBody = (news, name, destinationConf) => ({
    destinationConf,
    enabled: news.enabled ?? false,
    filter: news.filter,
    kind: news.kind,
    maxUploadBytes: news.maxUploadBytes,
    maxUploadIntervalSeconds: news.maxUploadIntervalSeconds,
    maxUploadRecords: news.maxUploadRecords,
    name,
    outputOptions: news.outputOptions,
    ownershipChallenge: news.ownershipChallenge,
});
const createJob = (scope, dataset, body) => (scope.zoneId !== undefined
    ? logpush.createJobForZone({ zoneId: scope.zoneId, dataset, ...body })
    : logpush.createJobForAccount({
        accountId: scope.accountId,
        dataset,
        ...body,
    })).pipe(Effect.map((job) => job));
const updateJob = (scope, jobId, body) => (scope.zoneId !== undefined
    ? logpush.updateJobForZone({ zoneId: scope.zoneId, jobId, ...body })
    : logpush.updateJobForAccount({
        accountId: scope.accountId,
        jobId,
        ...body,
    })).pipe(Effect.map((job) => job));
const asNumber = (v) => v == null ? undefined : typeof v === "string" ? Number(v) : v;
/**
 * Decide whether a PUT is needed. Observable fields are diffed against the
 * live job; write-only/redacted fields (`destination_conf`, `filter`,
 * `ownership_challenge`) fall back to a `news` vs `olds` comparison —
 * `olds === undefined` (adoption) forces a PUT so the job converges to the
 * declared destination/filter.
 */
const needsUpdate = (desired, news, olds, observed) => {
    if (olds === undefined)
        return true;
    if (news.destinationConf !== olds.destinationConf) {
        return true;
    }
    if (news.filter !== olds.filter)
        return true;
    if (desired.enabled !== (observed.enabled ?? false))
        return true;
    if (desired.name !== (observed.name ?? undefined))
        return true;
    if (desired.maxUploadBytes !== undefined &&
        desired.maxUploadBytes !== asNumber(observed.maxUploadBytes)) {
        return true;
    }
    if (desired.maxUploadIntervalSeconds !== undefined &&
        desired.maxUploadIntervalSeconds !==
            asNumber(observed.maxUploadIntervalSeconds)) {
        return true;
    }
    if (desired.maxUploadRecords !== undefined &&
        desired.maxUploadRecords !== asNumber(observed.maxUploadRecords)) {
        return true;
    }
    if (desired.outputOptions !== undefined &&
        !outputOptionsEqual(desired.outputOptions, observed.outputOptions)) {
        return true;
    }
    return false;
};
/**
 * Compare only the keys the user declared — Cloudflare fills the rest with
 * defaults we must not fight.
 */
const outputOptionsEqual = (desired, observed) => {
    const o = observed ?? {};
    for (const key of Object.keys(desired)) {
        const want = desired[key];
        if (want === undefined)
            continue;
        const have = o[key] ?? undefined;
        if (Array.isArray(want)) {
            if (!Array.isArray(have) ||
                want.length !== have.length ||
                want.some((v, i) => v !== have[i])) {
                return false;
            }
        }
        else if (want !== have) {
            return false;
        }
    }
    return true;
};
const undef = (v) => v == null ? undefined : v;
const toAttributes = (observed, scope) => {
    if (observed?.id == null ||
        observed.dataset == null ||
        observed.destinationConf == null) {
        return undefined;
    }
    return {
        jobId: observed.id,
        accountId: scope.accountId,
        zoneId: scope.zoneId,
        name: observed.name ?? "",
        dataset: observed.dataset,
        destinationConf: observed.destinationConf,
        enabled: observed.enabled ?? false,
        kind: observed.kind ?? "",
        errorMessage: undef(observed.errorMessage),
        lastComplete: undef(observed.lastComplete),
        lastError: undef(observed.lastError),
    };
};
//# sourceMappingURL=Job.js.map