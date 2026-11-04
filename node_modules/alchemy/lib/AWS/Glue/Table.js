import * as glue from "@distilled.cloud/aws/glue";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
import { cleanMap, retryWhileConcurrentModification, tableArn, } from "./internal.js";
/**
 * An AWS Glue Data Catalog table — a schema (columns), storage location, and
 * SerDe over data in S3 (or another store). This is the unit Athena, Redshift
 * Spectrum, and EMR query; it is the analytics foundation of a Glue database.
 * ### Creating Tables
 * **Example:** Parquet Table over S3
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const database = yield* AWS.Glue.Database("Analytics", {
 *   databaseName: "analytics",
 * });
 *
 * const events = yield* AWS.Glue.Table("Events", {
 *   databaseName: database.databaseName,
 *   tableName: "events",
 *   tableType: "EXTERNAL_TABLE",
 *   storageDescriptor: {
 *     location: "s3://my-data-lake/events/",
 *     inputFormat:
 *       "org.apache.hadoop.hive.ql.io.parquet.MapredParquetInputFormat",
 *     outputFormat:
 *       "org.apache.hadoop.hive.ql.io.parquet.MapredParquetOutputFormat",
 *     serdeInfo: {
 *       serializationLibrary:
 *         "org.apache.hadoop.hive.ql.io.parquet.serde.ParquetHiveSerDe",
 *     },
 *     columns: [
 *       { name: "id", type: "string" },
 *       { name: "amount", type: "double" },
 *     ],
 *   },
 *   partitionKeys: [{ name: "dt", type: "string" }],
 *   parameters: { classification: "parquet" },
 * });
 * ```
 *
 * @resource
 */
export const Table = Resource("AWS.Glue.Table");
const toColumn = (column) => ({
    Name: column.name,
    Type: column.type,
    Comment: column.comment,
    Parameters: column.parameters,
});
export const TableProvider = () => Provider.effect(Table, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.tableName ??
            (yield* createPhysicalName({ id, maxLength: 255, lowercase: true })));
    });
    const observe = Effect.fn(function* (databaseName, name, catalogId) {
        return yield* glue
            .getTable({
            DatabaseName: databaseName,
            Name: name,
            CatalogId: catalogId,
        })
            .pipe(Effect.map((r) => r.Table), Effect.catchTag("EntityNotFoundException", () => Effect.succeed(undefined)));
    });
    const buildTableInput = (name, props) => {
        const sd = props.storageDescriptor;
        return {
            Name: name,
            Description: props.description,
            Owner: props.owner,
            Retention: props.retention,
            TableType: props.tableType ?? "EXTERNAL_TABLE",
            StorageDescriptor: sd
                ? {
                    Columns: sd.columns?.map(toColumn),
                    Location: sd.location,
                    InputFormat: sd.inputFormat,
                    OutputFormat: sd.outputFormat,
                    Compressed: sd.compressed,
                    NumberOfBuckets: sd.numberOfBuckets,
                    SerdeInfo: sd.serdeInfo
                        ? {
                            Name: sd.serdeInfo.name,
                            SerializationLibrary: sd.serdeInfo.serializationLibrary,
                            Parameters: sd.serdeInfo.parameters,
                        }
                        : undefined,
                    BucketColumns: sd.bucketColumns,
                    Parameters: sd.parameters,
                    StoredAsSubDirectories: sd.storedAsSubDirectories,
                }
                : undefined,
            PartitionKeys: props.partitionKeys?.map(toColumn),
        };
    };
    return Table.Provider.of({
        stables: ["tableName", "databaseName", "tableArn", "catalogId"],
        list: () => Effect.gen(function* () {
            const { accountId, region } = yield* AWSEnvironment.current;
            const dbPages = yield* glue.getDatabases
                .pages({})
                .pipe(Stream.runCollect);
            const databases = Array.from(dbPages).flatMap((page) => page.DatabaseList ?? []);
            const nested = yield* Effect.forEach(databases, (db) => Effect.gen(function* () {
                const tablePages = yield* glue.getTables
                    .pages({ DatabaseName: db.Name, CatalogId: db.CatalogId })
                    .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)), Effect.catchTag("EntityNotFoundException", () => Effect.succeed([])));
                return tablePages
                    .flatMap((page) => page.TableList ?? [])
                    .map((table) => ({
                    tableName: table.Name,
                    databaseName: table.DatabaseName ?? db.Name,
                    tableArn: tableArn(region, table.CatalogId ?? db.CatalogId ?? accountId, table.DatabaseName ?? db.Name, table.Name),
                    catalogId: table.CatalogId ?? db.CatalogId ?? accountId,
                }));
            }), { concurrency: 5 });
            return nested.flat();
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const { accountId, region } = yield* AWSEnvironment.current;
            const databaseName = output?.databaseName ?? olds?.databaseName;
            if (databaseName === undefined)
                return undefined;
            const catalogId = output?.catalogId ?? olds?.catalogId ?? accountId;
            const name = output?.tableName ?? (yield* createName(id, olds ?? {}));
            const table = yield* observe(databaseName, name, catalogId);
            if (table === undefined)
                return undefined;
            const attrs = {
                tableName: table.Name,
                databaseName: table.DatabaseName ?? databaseName,
                tableArn: tableArn(region, table.CatalogId ?? catalogId, table.DatabaseName ?? databaseName, table.Name),
                catalogId: table.CatalogId ?? catalogId,
            };
            return (yield* hasAlchemyTags(id, cleanMap(table.Parameters)))
                ? attrs
                : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds);
            const newName = yield* createName(id, news);
            if (oldName !== newName)
                return { action: "replace" };
            if (olds.databaseName !== news.databaseName) {
                return { action: "replace" };
            }
            if ((olds.catalogId ?? undefined) !== (news.catalogId ?? undefined)) {
                return { action: "replace" };
            }
            // schema / storage / partition keys / parameters → update
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const { accountId, region } = yield* AWSEnvironment.current;
            const catalogId = news.catalogId ?? output?.catalogId ?? accountId;
            const name = output?.tableName ?? (yield* createName(id, news));
            const internalTags = yield* createInternalTags(id);
            const tableInput = {
                ...buildTableInput(name, news),
                Parameters: { ...news.parameters, ...internalTags },
            };
            // 1. OBSERVE
            let table = yield* observe(news.databaseName, name, catalogId);
            // 2. ENSURE / 3. SYNC
            if (table === undefined) {
                yield* glue
                    .createTable({
                    CatalogId: catalogId,
                    DatabaseName: news.databaseName,
                    TableInput: tableInput,
                })
                    .pipe(Effect.catchTag("AlreadyExistsException", () => Effect.void), retryWhileConcurrentModification);
            }
            else {
                // UpdateTable replaces the full TableInput. Force lets partition
                // keys change without a version conflict.
                yield* glue
                    .updateTable({
                    CatalogId: catalogId,
                    DatabaseName: news.databaseName,
                    TableInput: tableInput,
                    Force: true,
                })
                    .pipe(retryWhileConcurrentModification);
            }
            table = yield* observe(news.databaseName, name, catalogId);
            yield* session.note(name);
            return {
                tableName: name,
                databaseName: news.databaseName,
                tableArn: tableArn(region, table?.CatalogId ?? catalogId, news.databaseName, name),
                catalogId: table?.CatalogId ?? catalogId,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* glue
                .deleteTable({
                CatalogId: output.catalogId,
                DatabaseName: output.databaseName,
                Name: output.tableName,
            })
                .pipe(retryWhileConcurrentModification, Effect.catchTag("EntityNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=Table.js.map