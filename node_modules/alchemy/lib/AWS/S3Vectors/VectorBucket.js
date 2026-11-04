import * as s3vectors from "@distilled.cloud/aws/s3vectors";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags } from "../../Tags.js";
/**
 * An Amazon S3 Vectors bucket — durable storage for vector embeddings,
 * queryable by similarity. Create one or more {@link Index}es inside it to
 * store and query vectors.
 *
 * S3 Vectors is in preview; availability varies by region.
 *
 * ### Creating a Vector Bucket
 * **Example:** Basic Vector Bucket
 * ```typescript
 * import * as S3Vectors from "alchemy/AWS/S3Vectors";
 *
 * const bucket = yield* S3Vectors.VectorBucket("Embeddings", {});
 * ```
 *
 * **Example:** Vector Bucket with KMS Encryption
 * ```typescript
 * const bucket = yield* S3Vectors.VectorBucket("Embeddings", {
 *   encryption: { sseType: "aws:kms", kmsKeyArn: key.keyArn },
 * });
 * ```
 *
 * ### Bucket Policy
 * **Example:** Grant Another Account Read Access
 * ```typescript
 * const bucket = yield* S3Vectors.VectorBucket("Embeddings", {
 *   vectorBucketName: "shared-embeddings",
 *   policy: [
 *     {
 *       Effect: "Allow",
 *       Principal: { AWS: "arn:aws:iam::123456789012:root" },
 *       Action: ["s3vectors:GetVectors", "s3vectors:QueryVectors"],
 *       Resource:
 *         "arn:aws:s3vectors:us-east-1:999999999999:bucket/shared-embeddings/index/*",
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export const VectorBucket = Resource("AWS.S3Vectors.VectorBucket");
const encryptionKey = (e) => JSON.stringify({ sseType: e?.sseType, kmsKeyArn: e?.kmsKeyArn });
export const VectorBucketProvider = () => Provider.effect(VectorBucket, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        // The service rejects bucket names starting with `aws` as reserved.
        return (props.vectorBucketName ??
            (yield* createPhysicalName({
                id,
                maxLength: 63,
                forbiddenPrefixes: ["aws"],
            })).toLowerCase());
    });
    const observe = (vectorBucketName) => s3vectors.getVectorBucket({ vectorBucketName }).pipe(Effect.map((r) => r.vectorBucket), Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
    const observedTags = (resourceArn) => s3vectors.listTagsForResource({ resourceArn }).pipe(Effect.map((r) => Object.fromEntries(Object.entries(r.tags ?? {}).filter(([, v]) => v !== undefined))), Effect.catchTag("NotFoundException", () => Effect.succeed({})));
    const observedPolicy = (vectorBucketName) => s3vectors.getVectorBucketPolicy({ vectorBucketName }).pipe(Effect.map((r) => r.policy), Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
    const desiredEncryption = (props) => props.encryption
        ? {
            sseType: props.encryption.sseType,
            kmsKeyArn: props.encryption.kmsKeyArn,
        }
        : undefined;
    return VectorBucket.Provider.of({
        stables: ["vectorBucketName", "vectorBucketArn"],
        list: () => Effect.gen(function* () {
            const buckets = yield* s3vectors.listVectorBuckets
                .items({})
                .pipe(Stream.runCollect);
            return Array.from(buckets).map((b) => ({
                vectorBucketName: b.vectorBucketName,
                vectorBucketArn: b.vectorBucketArn,
            }));
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.vectorBucketName ?? (yield* createName(id, olds ?? {}));
            const found = yield* observe(name);
            if (!found)
                return undefined;
            const attrs = {
                vectorBucketName: found.vectorBucketName,
                vectorBucketArn: found.vectorBucketArn,
            };
            const tags = yield* observedTags(found.vectorBucketArn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds ?? {});
            const newName = yield* createName(id, news ?? {});
            if (oldName !== newName)
                return { action: "replace" };
            // Encryption is fixed at create time — any change replaces.
            if (encryptionKey(olds?.encryption) !== encryptionKey(news?.encryption)) {
                return { action: "replace" };
            }
            // fall through: engine default update (tags only)
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.vectorBucketName ?? (yield* createName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // 1. OBSERVE — cloud state is authoritative.
            let live = yield* observe(name);
            // 2. ENSURE — create when missing; a concurrent create surfaces as
            //    ConflictException, which we treat as a race and re-observe.
            if (live === undefined) {
                yield* s3vectors
                    .createVectorBucket({
                    vectorBucketName: name,
                    encryptionConfiguration: desiredEncryption(news),
                    tags: desiredTags,
                })
                    .pipe(Effect.catchTag("ConflictException", () => Effect.void));
                live = yield* observe(name);
            }
            const vectorBucketArn = live?.vectorBucketArn ?? output?.vectorBucketArn;
            // 3. SYNC TAGS — diff against OBSERVED cloud tags so adoption and
            //    drift converge (create-time tags only apply on first create).
            if (vectorBucketArn !== undefined) {
                const currentTags = yield* observedTags(vectorBucketArn);
                const { upsert, removed } = diffTags(currentTags, desiredTags);
                if (upsert.length > 0) {
                    yield* s3vectors.tagResource({
                        resourceArn: vectorBucketArn,
                        tags: Object.fromEntries(upsert.map((t) => [t.Key, t.Value])),
                    });
                }
                if (removed.length > 0) {
                    yield* s3vectors.untagResource({
                        resourceArn: vectorBucketArn,
                        tagKeys: removed,
                    });
                }
            }
            // 4. SYNC POLICY — diff desired against the OBSERVED bucket policy
            //    so adoption and drift converge (delete when the prop is gone).
            const desiredPolicy = news.policy !== undefined && news.policy.length > 0
                ? JSON.stringify({
                    Version: "2012-10-17",
                    Statement: news.policy,
                })
                : undefined;
            const existingPolicy = yield* observedPolicy(name);
            if (desiredPolicy !== undefined) {
                if (existingPolicy !== desiredPolicy) {
                    yield* s3vectors.putVectorBucketPolicy({
                        vectorBucketName: name,
                        policy: desiredPolicy,
                    });
                    yield* session.note(`Updated bucket policy: ${name}`);
                }
            }
            else if (existingPolicy !== undefined) {
                yield* s3vectors
                    .deleteVectorBucketPolicy({ vectorBucketName: name })
                    .pipe(Effect.catchTag("NotFoundException", () => Effect.void));
                yield* session.note(`Removed bucket policy: ${name}`);
            }
            yield* session.note(name);
            return { vectorBucketName: name, vectorBucketArn: vectorBucketArn };
        }),
        delete: Effect.fn(function* ({ output, force }) {
            const vectorBucketName = output.vectorBucketName;
            if (force !== true) {
                yield* s3vectors
                    .deleteVectorBucket({ vectorBucketName })
                    .pipe(Effect.catchTag("NotFoundException", () => Effect.void));
                return;
            }
            const purgeAndDelete = Effect.gen(function* () {
                // Indexes are scoped to their bucket and invisible to a global
                // nuke scan. Only the explicit force path may purge them.
                const indexes = yield* s3vectors.listIndexes
                    .items({ vectorBucketName })
                    .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)), Effect.catchTag("NotFoundException", () => Effect.succeed([])));
                yield* Effect.forEach(indexes, (index) => s3vectors
                    .deleteIndex({
                    vectorBucketName,
                    indexName: index.indexName,
                })
                    .pipe(Effect.catchTag("NotFoundException", () => Effect.void)), { concurrency: 4, discard: true });
                yield* s3vectors.deleteVectorBucket({ vectorBucketName });
            });
            yield* purgeAndDelete.pipe(
            // Index deletion is eventually consistent and bucket deletion can
            // report Conflict until all indexes disappear. Re-list on retry.
            Effect.retry({
                while: (e) => e._tag === "ConflictException" ||
                    e._tag === "ServiceUnavailableException",
                schedule: Schedule.max([
                    Schedule.exponential(500),
                    Schedule.recurs(8),
                ]),
            }), Effect.catchTag("NotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=VectorBucket.js.map