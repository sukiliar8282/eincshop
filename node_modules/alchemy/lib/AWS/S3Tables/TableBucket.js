import * as s3tables from "@distilled.cloud/aws/s3tables";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { AWSEnvironment } from "../Environment.js";
/**
 * An Amazon S3 Tables table bucket — a purpose-built bucket for storing
 * fully-managed Apache Iceberg tables.
 *
 * A table bucket is regional and holds {@link Namespace}s, which in turn hold
 * {@link Table}s. The bucket name is auto-generated from the app, stage, and
 * logical ID unless you provide one explicitly.
 * ### Creating Table Buckets
 * **Example:** Basic Table Bucket
 * ```typescript
 * import * as S3Tables from "alchemy/AWS/S3Tables";
 *
 * const bucket = yield* S3Tables.TableBucket("Analytics");
 * ```
 *
 * **Example:** Named Table Bucket
 * ```typescript
 * const bucket = yield* S3Tables.TableBucket("Analytics", {
 *   name: "my-analytics-tables",
 * });
 * ```
 *
 * ### Encryption
 * **Example:** KMS-encrypted Table Bucket
 * ```typescript
 * const bucket = yield* S3Tables.TableBucket("Secure", {
 *   encryptionConfiguration: {
 *     sseAlgorithm: "aws:kms",
 *     kmsKeyArn: key.keyArn,
 *   },
 * });
 * ```
 *
 * @resource
 */
export const TableBucket = Resource("AWS.S3Tables.TableBucket");
const createBucketName = (id, props) => Effect.gen(function* () {
    if (props.name) {
        return props.name;
    }
    // Table-bucket names follow S3-bucket DNS rules: lowercase, 3-63 chars,
    // and must not start with the service-reserved prefixes.
    return yield* createPhysicalName({
        id,
        maxLength: 63,
        lowercase: true,
        forbiddenPrefixes: ["xn--", "sthree-", "amzn-s3-demo-", "aws"],
    });
});
export const TableBucketProvider = () => Provider.succeed(TableBucket, {
    stables: ["tableBucketArn", "name", "ownerAccountId"],
    // Top-level resource — enumerate every table bucket in the ambient
    // account/region so the engine can detect drift/adoption.
    list: Effect.fn(function* () {
        const buckets = yield* s3tables.listTableBuckets.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.tableBuckets ?? [])));
        return buckets.map((b) => ({
            tableBucketArn: b.arn,
            name: b.name,
            ownerAccountId: b.ownerAccountId,
            createdAt: b.createdAt,
            tableBucketId: b.tableBucketId,
            type: b.type,
        }));
    }),
    read: Effect.fn(function* ({ id, olds, output }) {
        const { accountId, region } = yield* AWSEnvironment.current;
        const name = output?.name ?? (yield* createBucketName(id, olds ?? {}));
        const arn = output?.tableBucketArn ??
            `arn:aws:s3tables:${region}:${accountId}:bucket/${name}`;
        return yield* s3tables.getTableBucket({ tableBucketARN: arn }).pipe(Effect.map((b) => ({
            tableBucketArn: b.arn,
            name: b.name,
            ownerAccountId: b.ownerAccountId,
            createdAt: b.createdAt,
            tableBucketId: b.tableBucketId,
            type: b.type,
        })), Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
    }),
    diff: Effect.fn(function* ({ id, news = {}, olds = {} }) {
        if (!isResolved(news))
            return;
        const oldName = yield* createBucketName(id, olds);
        const newName = yield* createBucketName(id, news);
        if (oldName !== newName) {
            return { action: "replace" };
        }
        // Encryption is set at create time and cannot be changed in place.
        const oldEnc = JSON.stringify(olds.encryptionConfiguration ?? null);
        const newEnc = JSON.stringify(news.encryptionConfiguration ?? null);
        if (oldEnc !== newEnc) {
            return { action: "replace" };
        }
    }),
    reconcile: Effect.fn(function* ({ id, news = {}, output, session }) {
        const { accountId, region } = yield* AWSEnvironment.current;
        const name = output?.name ?? (yield* createBucketName(id, news));
        const arn = output?.tableBucketArn ??
            `arn:aws:s3tables:${region}:${accountId}:bucket/${name}`;
        // Observe — cloud state is authoritative. `output` is only a cache for
        // the deterministic ARN; the bucket may have been deleted out-of-band.
        let bucket = yield* s3tables.getTableBucket({ tableBucketARN: arn }).pipe(Effect.map((b) => b), Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
        // Ensure — create if missing. Tolerate a concurrent create
        // (`ConflictException`) as a race and fall through to re-read.
        if (bucket === undefined) {
            yield* s3tables
                .createTableBucket({
                name,
                encryptionConfiguration: news.encryptionConfiguration,
            })
                .pipe(Effect.asVoid, Effect.catchTag("ConflictException", () => Effect.void));
            // The control plane is eventually consistent: `getTableBucket` can
            // briefly 404 a bucket that `createTableBucket` just returned. Ride
            // out that propagation window on a bounded schedule.
            bucket = yield* s3tables.getTableBucket({ tableBucketARN: arn }).pipe(Effect.retry({
                while: (e) => e._tag === "NotFoundException",
                schedule: Schedule.max([
                    Schedule.exponential(500),
                    Schedule.recurs(8),
                ]),
            }));
        }
        yield* session.note(bucket.arn);
        return {
            tableBucketArn: bucket.arn,
            name: bucket.name,
            ownerAccountId: bucket.ownerAccountId,
            createdAt: bucket.createdAt,
            tableBucketId: bucket.tableBucketId,
            type: bucket.type,
        };
    }),
    delete: Effect.fn(function* ({ output, force }) {
        const tableBucketARN = output.tableBucketArn;
        if (force !== true) {
            yield* s3tables.deleteTableBucket({ tableBucketARN }).pipe(
            // Tracked children are normally deleted first, but their deletion
            // can take a few seconds to propagate. Do not purge untracked data
            // during ordinary destroy: a persistent Conflict is protective.
            Effect.retry({
                while: (e) => e._tag === "ConflictException",
                schedule: Schedule.max([Schedule.fixed(500), Schedule.recurs(8)]),
            }), Effect.catchTag("NotFoundException", () => Effect.void));
            return;
        }
        const purgeAndDelete = Effect.gen(function* () {
            // Nuke explicitly sets force after operator confirmation. It can
            // discover a top-level bucket even when child state was never saved,
            // so only this path may purge globally-invisible children.
            const tables = yield* s3tables.listTables
                .items({ tableBucketARN })
                .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)), Effect.catchTag("NotFoundException", () => Effect.succeed([])));
            yield* Effect.forEach(tables, (table) => s3tables
                .deleteTable({
                tableBucketARN,
                namespace: table.namespace[0],
                name: table.name,
            })
                .pipe(Effect.catchTag("NotFoundException", () => Effect.void)), { concurrency: 4, discard: true });
            const namespaces = yield* s3tables.listNamespaces
                .items({ tableBucketARN })
                .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)), Effect.catchTag("NotFoundException", () => Effect.succeed([])));
            yield* Effect.forEach(namespaces, (namespace) => s3tables
                .deleteNamespace({
                tableBucketARN,
                namespace: namespace.namespace[0],
            })
                .pipe(Effect.catchTag("NotFoundException", () => Effect.void)), { concurrency: 4, discard: true });
            yield* s3tables.deleteTableBucket({ tableBucketARN });
        });
        yield* purgeAndDelete.pipe(
        // Deletes propagate asynchronously. Re-listing on every bounded retry
        // also catches children that were briefly absent from a prior list.
        Effect.retry({
            while: (e) => e._tag === "ConflictException" ||
                e._tag === "TooManyRequestsException" ||
                e._tag === "InternalServerErrorException",
            schedule: Schedule.max([
                Schedule.exponential(500),
                Schedule.recurs(8),
            ]),
        }), Effect.catchTag("NotFoundException", () => Effect.void));
    }),
});
//# sourceMappingURL=TableBucket.js.map