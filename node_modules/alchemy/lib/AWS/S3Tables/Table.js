import * as s3tables from "@distilled.cloud/aws/s3tables";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * A fully-managed Apache Iceberg table within an S3 Tables {@link Namespace}.
 *
 * S3 Tables manages the table's storage, metadata, and maintenance
 * (compaction, snapshot expiration). Query it through engines like Amazon
 * Athena, Amazon EMR, or Apache Spark via the S3 Tables Iceberg catalog.
 * ### Creating Tables
 * **Example:** Table with an Iceberg schema
 * ```typescript
 * import * as S3Tables from "alchemy/AWS/S3Tables";
 *
 * const bucket = yield* S3Tables.TableBucket("Analytics");
 * const ns = yield* S3Tables.Namespace("Events", {
 *   tableBucket: bucket.tableBucketArn,
 * });
 * const table = yield* S3Tables.Table("PageViews", {
 *   tableBucket: bucket.tableBucketArn,
 *   namespace: ns.namespace,
 *   schema: {
 *     fields: [
 *       { name: "id", type: "long", required: true },
 *       { name: "url", type: "string" },
 *       { name: "ts", type: "timestamp" },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export const Table = Resource("AWS.S3Tables.Table");
const createTableName = (id, props) => Effect.gen(function* () {
    if (props.name) {
        return props.name;
    }
    // Table names allow lowercase letters, numbers, and underscores only.
    const base = yield* createPhysicalName({
        id,
        maxLength: 60,
        lowercase: true,
    });
    return base.replaceAll("-", "_");
});
const buildMetadata = (props) => props.schema
    ? {
        iceberg: {
            schema: {
                fields: props.schema.fields.map((f) => ({
                    name: f.name,
                    type: f.type,
                    required: f.required,
                })),
            },
        },
    }
    : undefined;
export const TableProvider = () => Provider.succeed(Table, {
    stables: ["tableArn", "name", "namespace", "tableBucketArn"],
    // Tables are scoped to a parent namespace; the engine drives lifecycle
    // from state rather than ambient enumeration.
    list: () => Effect.succeed([]),
    read: Effect.fn(function* ({ id, olds, output }) {
        const tableBucketArn = output?.tableBucketArn ?? olds?.tableBucket;
        const namespace = output?.namespace ?? olds?.namespace;
        if (typeof tableBucketArn !== "string" || typeof namespace !== "string") {
            return undefined;
        }
        const name = output?.name ?? (yield* createTableName(id, olds ?? {}));
        return yield* s3tables
            .getTable({ tableBucketARN: tableBucketArn, namespace, name })
            .pipe(Effect.map((t) => ({
            tableArn: t.tableARN,
            name: t.name,
            namespace: t.namespace[0] ?? namespace,
            tableBucketArn,
            versionToken: t.versionToken,
            metadataLocation: t.metadataLocation,
            warehouseLocation: t.warehouseLocation,
            format: t.format,
            type: t.type,
            createdAt: t.createdAt,
        })), Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
    }),
    diff: Effect.fn(function* ({ id, news, olds }) {
        if (!isResolved(news))
            return;
        if (news.tableBucket !== olds?.tableBucket ||
            news.namespace !== olds?.namespace) {
            return { action: "replace" };
        }
        const oldName = yield* createTableName(id, olds ?? {});
        const newName = yield* createTableName(id, news);
        if (oldName !== newName) {
            return { action: "replace" };
        }
        if ((news.format ?? "ICEBERG") !== (olds?.format ?? "ICEBERG")) {
            return { action: "replace" };
        }
        // Schema is fixed at create time; schema evolution is out of band.
        const oldSchema = JSON.stringify(olds?.schema ?? null);
        const newSchema = JSON.stringify(news.schema ?? null);
        if (oldSchema !== newSchema) {
            return { action: "replace" };
        }
    }),
    reconcile: Effect.fn(function* ({ id, news, output, session }) {
        const tableBucketArn = news.tableBucket;
        const namespace = news.namespace;
        const name = output?.name ?? (yield* createTableName(id, news));
        // Observe — read live state; the table may have been deleted
        // out-of-band even if `output` cached its ARN.
        let table = yield* s3tables
            .getTable({ tableBucketARN: tableBucketArn, namespace, name })
            .pipe(Effect.map((t) => t), Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
        // Ensure — create if missing, tolerating a concurrent create.
        if (table === undefined) {
            yield* s3tables
                .createTable({
                tableBucketARN: tableBucketArn,
                namespace,
                name,
                format: news.format ?? "ICEBERG",
                metadata: buildMetadata(news),
            })
                .pipe(Effect.asVoid, Effect.catchTag("ConflictException", () => Effect.void));
            // Eventual consistency: getTable can briefly 404 a table that
            // createTable just returned.
            table = yield* s3tables
                .getTable({ tableBucketARN: tableBucketArn, namespace, name })
                .pipe(Effect.retry({
                while: (e) => e._tag === "NotFoundException",
                schedule: Schedule.max([
                    Schedule.exponential(500),
                    Schedule.recurs(8),
                ]),
            }));
        }
        yield* session.note(table.tableARN);
        return {
            tableArn: table.tableARN,
            name: table.name,
            namespace: table.namespace[0] ?? namespace,
            tableBucketArn,
            versionToken: table.versionToken,
            metadataLocation: table.metadataLocation,
            warehouseLocation: table.warehouseLocation,
            format: table.format,
            type: table.type,
            createdAt: table.createdAt,
        };
    }),
    delete: Effect.fn(function* ({ output }) {
        // Deliberately NO versionToken: destroy is unconditional. Runtime
        // commits (UpdateTableMetadataLocation) rotate the token, so the
        // persisted one may be stale and would fail with ConflictException.
        yield* s3tables
            .deleteTable({
            tableBucketARN: output.tableBucketArn,
            namespace: output.namespace,
            name: output.name,
        })
            .pipe(Effect.catchTag("NotFoundException", () => Effect.void));
    }),
});
//# sourceMappingURL=Table.js.map