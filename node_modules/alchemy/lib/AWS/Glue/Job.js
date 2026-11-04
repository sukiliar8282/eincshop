import * as glue from "@distilled.cloud/aws/glue";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { toWireMinutes } from "../../Util/Duration.js";
import { AWSEnvironment } from "../Environment.js";
import { fetchObservedTags, jobArn, retryWhileRoleNotAssumable, syncTags, } from "./internal.js";
/**
 * An AWS Glue job — a Spark (`glueetl`), Python shell (`pythonshell`), or
 * streaming ETL job definition (script in S3 + IAM role + arguments). The
 * definition lifecycle is instant and free; job *runs* are billed and are
 * started via `startJobRun`.
 * ### Creating Jobs
 * **Example:** Python Shell Job
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const job = yield* AWS.Glue.Job("Etl", {
 *   role: jobRole.roleArn,
 *   command: {
 *     name: "pythonshell",
 *     pythonVersion: "3.9",
 *     scriptLocation: "s3://my-bucket/scripts/etl.py",
 *   },
 *   maxCapacity: 0.0625,
 *   glueVersion: "3.0",
 *   defaultArguments: { "--job-language": "python" },
 * });
 * ```
 *
 * **Example:** Spark ETL Job
 * ```typescript
 * const job = yield* AWS.Glue.Job("SparkEtl", {
 *   role: jobRole.roleArn,
 *   command: {
 *     name: "glueetl",
 *     scriptLocation: "s3://my-bucket/scripts/spark.py",
 *   },
 *   glueVersion: "4.0",
 *   workerType: "G.1X",
 *   numberOfWorkers: 2,
 *   timeout: "1 hour",
 * });
 * ```
 *
 * ### Running Jobs
 * **Example:** Start a Job Run from a Lambda
 * ```typescript
 * // init
 * const startJobRun = yield* AWS.Glue.StartJobRun(job);
 *
 * // runtime
 * const { JobRunId } = yield* startJobRun({});
 * ```
 *
 * @resource
 */
export const Job = Resource("AWS.Glue.Job");
export const JobProvider = () => Provider.effect(Job, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.jobName ?? (yield* createPhysicalName({ id, maxLength: 255 })));
    });
    const observe = Effect.fn(function* (name) {
        return yield* glue.getJob({ JobName: name }).pipe(Effect.map((r) => r.Job), Effect.catchTag("EntityNotFoundException", () => Effect.succeed(undefined)));
    });
    const buildCommand = (command) => ({
        Name: command.name,
        ScriptLocation: command.scriptLocation,
        PythonVersion: command.pythonVersion,
        Runtime: command.runtime,
    });
    const buildDefinition = (props) => ({
        Role: props.role,
        Command: buildCommand(props.command),
        Description: props.description,
        DefaultArguments: props.defaultArguments,
        NonOverridableArguments: props.nonOverridableArguments,
        Connections: props.connections !== undefined
            ? { Connections: props.connections }
            : undefined,
        MaxRetries: props.maxRetries,
        Timeout: toWireMinutes(props.timeout),
        MaxCapacity: props.maxCapacity,
        GlueVersion: props.glueVersion,
        NumberOfWorkers: props.numberOfWorkers,
        WorkerType: props.workerType,
        ExecutionClass: props.executionClass,
        ExecutionProperty: props.executionProperty
            ? { MaxConcurrentRuns: props.executionProperty.maxConcurrentRuns }
            : undefined,
    });
    return Job.Provider.of({
        stables: ["jobName", "jobArn"],
        list: () => Effect.gen(function* () {
            const { accountId, region } = yield* AWSEnvironment.current;
            const pages = yield* glue.getJobs.pages({}).pipe(Stream.runCollect);
            return Array.from(pages)
                .flatMap((page) => page.Jobs ?? [])
                .filter((j) => j.Name !== undefined)
                .map((j) => ({
                jobName: j.Name,
                jobArn: jobArn(region, accountId, j.Name),
                role: j.Role ?? "",
            }));
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const { accountId, region } = yield* AWSEnvironment.current;
            const name = output?.jobName ?? (yield* createName(id, olds ?? {}));
            const job = yield* observe(name);
            if (job?.Name === undefined)
                return undefined;
            const arn = jobArn(region, accountId, job.Name);
            const attrs = {
                jobName: job.Name,
                jobArn: arn,
                role: job.Role ?? "",
            };
            const tags = yield* fetchObservedTags(arn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds);
            const newName = yield* createName(id, news);
            if (oldName !== newName)
                return { action: "replace" };
            // everything else is UpdateJob-able
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const { accountId, region } = yield* AWSEnvironment.current;
            const name = output?.jobName ?? (yield* createName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            const arn = jobArn(region, accountId, name);
            // 1. OBSERVE
            let job = yield* observe(name);
            // 2. ENSURE / 3. SYNC
            if (job === undefined) {
                yield* retryWhileRoleNotAssumable(glue.createJob({
                    Name: name,
                    ...buildDefinition(news),
                    Tags: desiredTags,
                })).pipe(Effect.catchTag("AlreadyExistsException", () => Effect.void));
            }
            else {
                // UpdateJob replaces the full JobUpdate (Name is not part of it).
                yield* retryWhileRoleNotAssumable(glue.updateJob({
                    JobName: name,
                    JobUpdate: buildDefinition(news),
                }));
            }
            // 3b. SYNC TAGS
            const observedTags = yield* fetchObservedTags(arn);
            yield* syncTags(arn, observedTags, desiredTags);
            job = yield* observe(name);
            yield* session.note(name);
            return {
                jobName: name,
                jobArn: arn,
                role: job?.Role ?? news.role,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            // DeleteJob is idempotent — the API returns success (not an error)
            // when the job definition is already gone.
            yield* glue.deleteJob({ JobName: output.jobName });
        }),
    });
}));
//# sourceMappingURL=Job.js.map