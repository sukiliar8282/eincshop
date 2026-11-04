import * as keyspaces from "@distilled.cloud/aws/keyspaces";
import * as keyspacesstreams from "@distilled.cloud/aws/keyspacesstreams";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags } from "../../Tags.js";
import { toWireSeconds } from "../../Util/Duration.js";
/**
 * An Amazon Keyspaces (for Apache Cassandra) table.
 *
 * Tables are serverless and provisioned asynchronously (`CREATING` ->
 * `ACTIVE`), usually within a minute; the provider waits for `ACTIVE`
 * (bounded) before returning. Schema mutations (adding columns, changing
 * capacity/TTL/PITR) are applied in place; changing keys replaces the table.
 * ### Creating a Table
 * **Example:** Simple Key-Value Table
 * ```typescript
 * const table = yield* Table("Sessions", {
 *   keyspaceName: keyspace.keyspaceName,
 *   columns: [
 *     { name: "id", type: "uuid" },
 *     { name: "data", type: "text" },
 *   ],
 *   partitionKeys: ["id"],
 * });
 * ```
 *
 * **Example:** Table with a Clustering Key and TTL
 * ```typescript
 * const table = yield* Table("Events", {
 *   keyspaceName: keyspace.keyspaceName,
 *   columns: [
 *     { name: "device", type: "text" },
 *     { name: "ts", type: "timestamp" },
 *     { name: "payload", type: "blob" },
 *   ],
 *   partitionKeys: ["device"],
 *   clusteringKeys: [{ name: "ts", orderBy: "DESC" }],
 *   ttlEnabled: true,
 *   defaultTimeToLive: "1 day",
 * });
 * ```
 *
 * ### Change Data Capture
 * **Example:** CDC-Enabled Table
 * ```typescript
 * const table = yield* Table("Orders", {
 *   keyspaceName: keyspace.keyspaceName,
 *   columns: [
 *     { name: "id", type: "uuid" },
 *     { name: "total", type: "int" },
 *   ],
 *   partitionKeys: ["id"],
 *   cdcSpecification: {
 *     status: "ENABLED",
 *     viewType: "NEW_AND_OLD_IMAGES",
 *   },
 * });
 * // table.latestStreamArn → consume via the TableStreams binding
 * ```
 *
 * @resource
 */
export const Table = Resource("AWS.Keyspaces.Table");
const toTagRecord = (tags) => Object.fromEntries((tags ?? []).map((t) => [t.key, t.value]));
const buildSchema = (props) => ({
    allColumns: props.columns.map((c) => ({ name: c.name, type: c.type })),
    partitionKeys: props.partitionKeys.map((name) => ({ name })),
    clusteringKeys: props.clusteringKeys?.map((c) => ({
        name: c.name,
        orderBy: c.orderBy ?? "ASC",
    })),
    staticColumns: props.staticColumns?.map((name) => ({ name })),
});
const activeStatuses = new Set(["ACTIVE"]);
export const TableProvider = () => Provider.effect(Table, Effect.gen(function* () {
    const toName = (id, props) => props.tableName
        ? Effect.succeed(props.tableName)
        : createPhysicalName({ id, maxLength: 48 }).pipe(Effect.map((n) => n.replaceAll("-", "_")));
    const readTable = Effect.fn(function* (keyspaceName, tableName) {
        return yield* keyspaces
            .getTable({ keyspaceName, tableName })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    const readTags = Effect.fn(function* (arn) {
        const tags = yield* keyspaces.listTagsForResource
            .items({ resourceArn: arn })
            .pipe(Stream.runCollect, Effect.map((c) => Array.from(c)), Effect.catch(() => Effect.succeed([])));
        return toTagRecord(tags);
    });
    // Resolve the most recent CDC stream's ARN (streams are labeled with
    // their creation timestamp; the lexicographically greatest label is the
    // latest). Only meaningful while CDC is (or was recently) enabled.
    const readLatestStreamArn = Effect.fn(function* (keyspaceName, tableName) {
        const response = yield* keyspacesstreams
            .listStreams({ keyspaceName, tableName })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        const sorted = [...(response?.streams ?? [])].sort((a, b) => b.streamLabel.localeCompare(a.streamLabel));
        return sorted[0]?.streamArn;
    });
    const isCdcEnabled = (table) => {
        const status = table.cdcSpecification?.status;
        return status === "ENABLED" || status === "ENABLING";
    };
    // A freshly-enabled stream can lag ListStreams visibility briefly;
    // poll (bounded ~60s) and fall back to undefined rather than failing
    // the reconcile.
    const waitForStreamArn = Effect.fn(function* (keyspaceName, tableName) {
        return yield* readLatestStreamArn(keyspaceName, tableName).pipe(Effect.flatMap((arn) => arn !== undefined
            ? Effect.succeed(arn)
            : Effect.fail(new Error(`CDC stream for '${keyspaceName}.${tableName}' not yet visible`))), Effect.retry({
            schedule: Schedule.max([
                Schedule.fixed("5 seconds"),
                Schedule.recurs(12),
            ]),
        }), Effect.catch(() => Effect.succeed(undefined)));
    });
    // Bounded readiness wait; Keyspaces tables typically reach ACTIVE within
    // a minute. Budget ~5 min (60 * 5s). When `requiredColumns` is provided
    // the wait also blocks until those columns are visible in the schema —
    // AddColumn updates return before the table transitions out of ACTIVE and
    // the new columns propagate to GetTable with a short lag.
    const waitForActive = Effect.fn(function* (keyspaceName, tableName, requiredColumns) {
        const policy = Schedule.max([
            Schedule.fixed("5 seconds"),
            Schedule.recurs(60),
        ]);
        return yield* readTable(keyspaceName, tableName).pipe(Effect.flatMap((table) => {
            if (table === undefined) {
                return Effect.fail(new Error(`Keyspaces table '${tableName}' not found`));
            }
            if (!activeStatuses.has(table.status ?? "")) {
                return Effect.fail(new Error(`Keyspaces table '${tableName}' not active (status: ${table.status})`));
            }
            if (requiredColumns !== undefined) {
                const present = new Set((table.schemaDefinition?.allColumns ?? []).map((c) => c.name));
                const missing = requiredColumns.filter((c) => !present.has(c));
                if (missing.length > 0) {
                    return Effect.fail(new Error(`Keyspaces table '${tableName}' missing columns: ${missing.join(", ")}`));
                }
            }
            return Effect.succeed(table);
        }), Effect.retry({ schedule: policy }));
    });
    const toCapacity = (capacity) => capacity === undefined
        ? undefined
        : {
            throughputMode: capacity.throughputMode,
            readCapacityUnits: capacity.readCapacityUnits,
            writeCapacityUnits: capacity.writeCapacityUnits,
        };
    return {
        stables: ["keyspaceName", "tableName", "tableArn"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            const oldProps = olds;
            if (oldProps === undefined)
                return undefined;
            if (news.keyspaceName !== oldProps.keyspaceName) {
                return { action: "replace" };
            }
            if ((yield* toName(id, oldProps)) !== (yield* toName(id, news))) {
                return { action: "replace" };
            }
            // Keys and column removals/retypes require a replacement; pure
            // column additions are handled in reconcile via UpdateTable.
            const newCols = new Map(news.columns.map((c) => [c.name, c.type]));
            const removedOrRetyped = oldProps.columns.some((c) => newCols.get(c.name) !== c.type);
            const keysChanged = JSON.stringify([...news.partitionKeys].sort()) !==
                JSON.stringify([...oldProps.partitionKeys].sort()) ||
                JSON.stringify((news.clusteringKeys ?? [])
                    .map((c) => `${c.name}:${c.orderBy ?? "ASC"}`)
                    .sort()) !==
                    JSON.stringify((oldProps.clusteringKeys ?? [])
                        .map((c) => `${c.name}:${c.orderBy ?? "ASC"}`)
                        .sort()) ||
                JSON.stringify([...(news.staticColumns ?? [])].sort()) !==
                    JSON.stringify([...(oldProps.staticColumns ?? [])].sort());
            if (removedOrRetyped || keysChanged) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const props = (olds ?? {});
            const keyspaceName = output?.keyspaceName ?? props.keyspaceName;
            if (keyspaceName === undefined)
                return undefined;
            const tableName = output?.tableName ?? (yield* toName(id, props));
            const found = yield* readTable(keyspaceName, tableName);
            if (found === undefined || found.status === "DELETING") {
                return undefined;
            }
            const attrs = {
                keyspaceName: found.keyspaceName,
                tableName: found.tableName,
                tableArn: found.resourceArn,
                status: found.status ?? "ACTIVE",
                latestStreamArn: isCdcEnabled(found)
                    ? yield* readLatestStreamArn(found.keyspaceName, found.tableName)
                    : undefined,
            };
            const tags = yield* readTags(found.resourceArn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const props = news;
            const keyspaceName = props.keyspaceName;
            const tableName = output?.tableName ?? (yield* toName(id, props));
            // The Keyspaces API expects the default TTL in whole seconds.
            const desiredTtlSeconds = toWireSeconds(props.defaultTimeToLive);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...props.tags };
            // 1. Observe — cloud state is authoritative.
            let observed = yield* readTable(keyspaceName, tableName);
            // 2. Ensure — create if missing; tolerate the AlreadyExists race.
            if (observed === undefined) {
                yield* keyspaces
                    .createTable({
                    keyspaceName,
                    tableName,
                    schemaDefinition: buildSchema(props),
                    capacitySpecification: toCapacity(props.capacity),
                    pointInTimeRecovery: props.pointInTimeRecovery
                        ? { status: "ENABLED" }
                        : undefined,
                    ttl: props.ttlEnabled ? { status: "ENABLED" } : undefined,
                    defaultTimeToLive: desiredTtlSeconds,
                    cdcSpecification: props.cdcSpecification?.status === "ENABLED"
                        ? {
                            status: "ENABLED",
                            viewType: props.cdcSpecification.viewType ??
                                "NEW_AND_OLD_IMAGES",
                        }
                        : undefined,
                    tags: Object.entries(desiredTags).map(([key, value]) => ({
                        key,
                        value,
                    })),
                })
                    .pipe(Effect.catchTag("ConflictException", () => Effect.void));
            }
            observed = yield* waitForActive(keyspaceName, tableName);
            // 3. Sync mutable aspects against observed state.
            const update = {
                keyspaceName,
                tableName,
            };
            let needsUpdate = false;
            const observedCols = new Set((observed.schemaDefinition?.allColumns ?? []).map((c) => c.name));
            const addColumns = props.columns.filter((c) => !observedCols.has(c.name));
            if (addColumns.length > 0) {
                update.addColumns = addColumns.map((c) => ({
                    name: c.name,
                    type: c.type,
                }));
                needsUpdate = true;
            }
            const desiredCapacity = toCapacity(props.capacity);
            if (desiredCapacity !== undefined &&
                (desiredCapacity.throughputMode !==
                    observed.capacitySpecification?.throughputMode ||
                    (desiredCapacity.throughputMode === "PROVISIONED" &&
                        (desiredCapacity.readCapacityUnits !==
                            observed.capacitySpecification?.readCapacityUnits ||
                            desiredCapacity.writeCapacityUnits !==
                                observed.capacitySpecification?.writeCapacityUnits)))) {
                update.capacitySpecification = desiredCapacity;
                needsUpdate = true;
            }
            const desiredPitr = props.pointInTimeRecovery
                ? "ENABLED"
                : "DISABLED";
            if (desiredPitr !== (observed.pointInTimeRecovery?.status ?? "DISABLED")) {
                update.pointInTimeRecovery = { status: desiredPitr };
                needsUpdate = true;
            }
            if (props.ttlEnabled && observed.ttl?.status !== "ENABLED") {
                update.ttl = { status: "ENABLED" };
                needsUpdate = true;
            }
            if (desiredTtlSeconds !== undefined &&
                desiredTtlSeconds !== observed.defaultTimeToLive) {
                update.defaultTimeToLive = desiredTtlSeconds;
                needsUpdate = true;
            }
            const desiredCdcEnabled = props.cdcSpecification?.status === "ENABLED";
            if (desiredCdcEnabled !== isCdcEnabled(observed)) {
                update.cdcSpecification = desiredCdcEnabled
                    ? {
                        status: "ENABLED",
                        viewType: props.cdcSpecification?.viewType ?? "NEW_AND_OLD_IMAGES",
                    }
                    : { status: "DISABLED" };
                needsUpdate = true;
            }
            if (needsUpdate) {
                yield* keyspaces.updateTable(update);
                observed = yield* waitForActive(keyspaceName, tableName, props.columns.map((c) => c.name));
            }
            // 3b. Sync tags — diff against OBSERVED cloud tags.
            const observedTags = yield* readTags(observed.resourceArn);
            const { upsert, removed } = diffTags(observedTags, desiredTags);
            if (upsert.length > 0) {
                yield* keyspaces.tagResource({
                    resourceArn: observed.resourceArn,
                    tags: upsert.map((t) => ({ key: t.Key, value: t.Value })),
                });
            }
            if (removed.length > 0) {
                yield* keyspaces.untagResource({
                    resourceArn: observed.resourceArn,
                    tags: removed.map((key) => ({ key, value: "" })),
                });
            }
            yield* session.note(`${keyspaceName}.${tableName}`);
            return {
                keyspaceName: observed.keyspaceName,
                tableName: observed.tableName,
                tableArn: observed.resourceArn,
                status: observed.status ?? "ACTIVE",
                latestStreamArn: isCdcEnabled(observed)
                    ? yield* waitForStreamArn(observed.keyspaceName, observed.tableName)
                    : undefined,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            const { keyspaceName, tableName } = output;
            yield* keyspaces.deleteTable({ keyspaceName, tableName }).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void), 
            // A table still CREATING/UPDATING rejects delete with
            // ConflictException; retry until it settles.
            Effect.retry({
                while: (e) => e._tag === "ConflictException",
                schedule: Schedule.max([
                    Schedule.fixed("5 seconds"),
                    Schedule.recurs(24),
                ]),
            }));
            // Wait (bounded) until the table is gone so the parent keyspace can
            // be deleted without a ConflictException.
            yield* readTable(keyspaceName, tableName).pipe(Effect.flatMap((t) => t === undefined
                ? Effect.void
                : Effect.fail(new Error(`Table '${tableName}' still deleting`))), Effect.retry({
                schedule: Schedule.max([
                    Schedule.fixed("3 seconds"),
                    Schedule.recurs(20),
                ]),
            }), Effect.catch(() => Effect.void));
        }),
        // Table is keyed by a parent keyspace and cannot be enumerated
        // account-wide without iterating every keyspace; treated as a
        // sub-resource per the factory list() convention.
        list: () => Effect.succeed([]),
    };
}));
//# sourceMappingURL=Table.js.map