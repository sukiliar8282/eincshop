import * as bcm from "@distilled.cloud/aws/bcm-data-exports";
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
 * An AWS Billing and Cost Management data export (Data Exports / CUR 2.0) —
 * delivers billing and cost management data selected by an SQL query to an
 * S3 bucket on a refresh cadence.
 *
 * Data Exports is a global service pinned to `us-east-1`; exports are free
 * (standard S3 storage rates apply to the delivered objects).
 *
 * The destination bucket must grant the Data Exports service principals
 * write access via its bucket policy (see the example below).
 *
 * ### Creating an Export
 * **Example:** CUR 2.0 export to an S3 bucket
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const bucket = yield* AWS.S3.Bucket("BillingData", {
 *   forceDestroy: true,
 *   policy: [
 *     {
 *       Effect: "Allow",
 *       Principal: {
 *         Service: [
 *           "billingreports.amazonaws.com",
 *           "bcm-data-exports.amazonaws.com",
 *         ],
 *       },
 *       Action: ["s3:PutObject", "s3:GetBucketPolicy"],
 *       Resource: [bucket.bucketArn, AWS.interpolate`${bucket.bucketArn}/*`],
 *     },
 *   ],
 * });
 *
 * const cur = yield* AWS.BCMDataExports.Export("Cur2", {
 *   dataQuery: {
 *     queryStatement:
 *       "SELECT identity_line_item_id, line_item_unblended_cost FROM COST_AND_USAGE_REPORT",
 *     tableConfigurations: {
 *       COST_AND_USAGE_REPORT: { TIME_GRANULARITY: "HOURLY" },
 *     },
 *   },
 *   s3Destination: {
 *     s3Bucket: bucket.bucketName,
 *     s3Prefix: "cur2",
 *     s3Region: "us-west-2",
 *   },
 * });
 * ```
 *
 * @resource
 */
export const Export = Resource("AWS.BCMDataExports.Export");
const retryThrottling = (self) => Effect.retry(self, {
    while: (e) => e._tag === "ThrottlingException",
    schedule: Schedule.max([
        Schedule.exponential("1 second"),
        Schedule.recurs(5),
    ]),
});
export const ExportProvider = () => Provider.effect(Export, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.exportName ??
            (yield* createPhysicalName({ id, maxLength: 100 })));
    });
    const buildExport = (name, props) => ({
        Name: name,
        Description: props.description,
        DataQuery: {
            QueryStatement: props.dataQuery.queryStatement,
            TableConfigurations: props.dataQuery.tableConfigurations,
        },
        DestinationConfigurations: {
            S3Destination: {
                S3Bucket: props.s3Destination.s3Bucket,
                S3Prefix: props.s3Destination.s3Prefix,
                S3Region: props.s3Destination.s3Region,
                S3BucketOwner: props.s3Destination.s3BucketOwner,
                S3OutputConfigurations: {
                    OutputType: props.s3Destination.s3OutputConfigurations?.outputType ??
                        "CUSTOM",
                    Format: props.s3Destination.s3OutputConfigurations?.format ??
                        "TEXT_OR_CSV",
                    Compression: props.s3Destination.s3OutputConfigurations?.compression ??
                        "GZIP",
                    Overwrite: props.s3Destination.s3OutputConfigurations?.overwrite ??
                        "OVERWRITE_REPORT",
                },
            },
        },
        RefreshCadence: {
            Frequency: props.refreshCadence?.frequency ?? "SYNCHRONOUS",
        },
    });
    // Project both the observed and the desired definition through the
    // same shape (fixed key order, defaults filled) so wire echoes — key
    // ordering, an echoed S3BucketOwner — never register as drift.
    const normalizeExport = (e) => {
        const dest = e.DestinationConfigurations.S3Destination;
        return JSON.stringify({
            Name: e.Name,
            Description: e.Description ?? "",
            QueryStatement: e.DataQuery.QueryStatement,
            TableConfigurations: Object.fromEntries(Object.entries(e.DataQuery.TableConfigurations ?? {})
                .sort(([l], [r]) => l.localeCompare(r))
                .map(([table, props]) => [
                table,
                Object.fromEntries(Object.entries(props ?? {}).sort(([l], [r]) => l.localeCompare(r))),
            ])),
            S3Bucket: dest.S3Bucket,
            S3Prefix: dest.S3Prefix,
            S3Region: dest.S3Region,
            OutputType: dest.S3OutputConfigurations.OutputType,
            Format: dest.S3OutputConfigurations.Format,
            Compression: dest.S3OutputConfigurations.Compression,
            Overwrite: dest.S3OutputConfigurations.Overwrite,
            Frequency: e.RefreshCadence.Frequency,
        });
    };
    // S3BucketOwner is compared only when the user sets it — AWS may echo
    // the effective owner account on reads even when it was never supplied.
    const sameExport = (live, desired) => normalizeExport(live) === normalizeExport(desired) &&
        (desired.DestinationConfigurations.S3Destination.S3BucketOwner ===
            undefined ||
            desired.DestinationConfigurations.S3Destination.S3BucketOwner ===
                live.DestinationConfigurations.S3Destination.S3BucketOwner);
    const findArnByName = Effect.fn(function* (name) {
        const matches = yield* bcm.listExports.items({}).pipe(Stream.filter((e) => e.ExportName === name), Stream.take(1), Stream.runCollect);
        return Array.from(matches)[0]?.ExportArn;
    });
    // Observe the live export definition. `arnHint` (from cached output)
    // is verified, not trusted — a stale ARN falls through to name lookup.
    const observe = Effect.fn(function* (name, arnHint) {
        const arns = arnHint !== undefined ? [arnHint] : [];
        const byName = yield* findArnByName(name);
        if (byName !== undefined && byName !== arnHint)
            arns.push(byName);
        for (const arn of arns) {
            const found = yield* bcm
                .getExport({ ExportArn: arn })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            if (found?.Export !== undefined) {
                return { exportArn: arn, export: found.Export };
            }
        }
        return undefined;
    });
    const fetchObservedTags = Effect.fn(function* (arn) {
        return yield* bcm.listTagsForResource({ ResourceArn: arn }).pipe(Effect.map((r) => Object.fromEntries((r.ResourceTags ?? []).map((t) => [t.Key, t.Value]))), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed({})));
    });
    return Export.Provider.of({
        stables: ["exportName", "exportArn"],
        list: () => bcm.listExports.items({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).map((e) => ({
            exportName: e.ExportName,
            exportArn: e.ExportArn,
        })))),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.exportName ?? (yield* createName(id, olds ?? {}));
            const live = yield* observe(name, output?.exportArn);
            if (live === undefined)
                return undefined;
            const attrs = { exportName: name, exportArn: live.exportArn };
            const tags = yield* fetchObservedTags(live.exportArn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        // Replacement detection only — the export name is immutable; every
        // other property updates in place via updateExport.
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds);
            const newName = yield* createName(id, news);
            if (oldName !== newName)
                return { action: "replace" };
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.exportName ?? (yield* createName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            const desired = buildExport(name, news);
            // 1. OBSERVE — cloud state is authoritative; output only caches
            //    the ARN.
            const live = yield* observe(name, output?.exportArn);
            let exportArn;
            if (live === undefined) {
                // 2. ENSURE — create the export with all tags attached.
                yield* session.note(`creating data export ${name}`);
                const created = yield* retryThrottling(bcm.createExport({
                    Export: desired,
                    ResourceTags: Object.entries(desiredTags).map(([Key, Value]) => ({ Key, Value })),
                }));
                exportArn =
                    created.ExportArn ?? (yield* findArnByName(name)) ?? name;
            }
            else {
                exportArn = live.exportArn;
                // 3. SYNC — updateExport overwrites the full definition; skip
                //    the call when the observed definition already matches.
                if (!sameExport(live.export, desired)) {
                    yield* session.note(`updating data export ${name}`);
                    yield* retryThrottling(bcm.updateExport({ ExportArn: exportArn, Export: desired }));
                }
            }
            // 3b. SYNC TAGS — diff against observed cloud tags.
            const observedTags = yield* fetchObservedTags(exportArn);
            const { upsert, removed } = diffTags(observedTags, desiredTags);
            if (upsert.length > 0) {
                yield* bcm.tagResource({
                    ResourceArn: exportArn,
                    ResourceTags: upsert,
                });
            }
            if (removed.length > 0) {
                yield* bcm.untagResource({
                    ResourceArn: exportArn,
                    ResourceTagKeys: removed,
                });
            }
            yield* session.note(name);
            return { exportName: name, exportArn };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* bcm
                .deleteExport({ ExportArn: output.exportArn })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=Export.js.map