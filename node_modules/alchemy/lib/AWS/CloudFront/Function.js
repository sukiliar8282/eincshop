import * as cloudfront from "@distilled.cloud/aws/cloudfront";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * A CloudFront Function for viewer request and response customization.
 *
 * CloudFront Functions are lightweight JavaScript handlers that run at the
 * edge and can be attached to distribution cache behaviors.
 * ### Creating Functions
 * **Example:** Viewer Request Function
 * ```typescript
 * const fn = yield* Function("RouterRequestFunction", {
 *   code: `
 * async function handler(event) {
 *   event.request.headers["x-forwarded-host"] = {
 *     value: event.request.headers.host.value,
 *   };
 *   return event.request;
 * }
 * `,
 * });
 * ```
 *
 * @resource
 */
export const Function = Resource("AWS.CloudFront.Function");
export const FunctionProvider = () => Provider.effect(Function, Effect.gen(function* () {
    const describe = Effect.fn(function* (name, stage) {
        return yield* cloudfront
            .describeFunction({
            Name: name,
            Stage: stage,
        })
            .pipe(Effect.catchTag("NoSuchFunctionExists", () => Effect.succeed(undefined)));
    });
    const getCurrent = Effect.fn(function* (name) {
        const live = yield* describe(name, "LIVE");
        if (live?.FunctionSummary) {
            return live;
        }
        return yield* describe(name, "DEVELOPMENT");
    });
    const getDevelopmentEtag = Effect.fn(function* (name) {
        const current = yield* describe(name, "DEVELOPMENT");
        return current?.ETag;
    });
    const publish = Effect.fn(function* (name, etag) {
        if (!etag) {
            return yield* Effect.fail(new Error(`CloudFront Function '${name}' is missing an ETag for publish`));
        }
        yield* cloudfront.publishFunction({
            Name: name,
            IfMatch: etag,
        });
        return yield* describe(name, "LIVE");
    });
    return {
        stables: ["functionArn", "functionName"],
        // CloudFront is global; listFunctions enumerates every function in the
        // account. It is non-paginated in distilled but uses Marker/NextMarker,
        // so we page manually until NextMarker is absent. All CloudFront
        // functions are custom (no AWS-managed ones), so every item is ours.
        list: () => Effect.gen(function* () {
            const items = [];
            let marker = undefined;
            do {
                const listed = yield* cloudfront.listFunctions({ Marker: marker });
                for (const summary of listed.FunctionList?.Items ?? []) {
                    items.push(toAttrs(summary, undefined, summary.Name ?? ""));
                }
                marker = listed.FunctionList?.NextMarker;
            } while (marker);
            return items;
        }),
        diff: Effect.fn(function* ({ id, olds, news: _news }) {
            if (!isResolved(_news))
                return undefined;
            const news = _news;
            if ((yield* createName(id, olds ?? {})) !==
                (yield* createName(id, news))) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.functionName ?? (yield* createName(id, olds ?? {}));
            const current = yield* getCurrent(name);
            if (!current?.FunctionSummary) {
                return undefined;
            }
            return toAttrs(current.FunctionSummary, current.ETag, name);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.functionName ?? (yield* createName(id, news));
            // Observe — describe the function (LIVE stage preferred,
            // DEVELOPMENT fallback). We don't trust `output` because the
            // function may have been deleted out-of-band.
            const observedDevelopment = yield* describe(name, "DEVELOPMENT");
            // Ensure — create the function if it's missing. Tolerate
            // `FunctionAlreadyExists` as a race with a peer reconciler. The
            // newly created function lives in DEVELOPMENT; we publish it to
            // LIVE below, in the same flow that handles already-existing
            // functions.
            const developmentEtag = observedDevelopment
                ? observedDevelopment.ETag
                : yield* Effect.gen(function* () {
                    const created = yield* cloudfront
                        .createFunction({
                        Name: name,
                        FunctionConfig: {
                            Comment: news.comment ?? "",
                            Runtime: news.runtime ?? "cloudfront-js-2.0",
                            KeyValueStoreAssociations: toKvAssociations(news.keyValueStoreArns),
                        },
                        FunctionCode: new TextEncoder().encode(news.code),
                    })
                        .pipe(Effect.catchTag("FunctionAlreadyExists", () => describe(name, "DEVELOPMENT").pipe(Effect.flatMap((existing) => existing
                        ? Effect.succeed(existing)
                        : Effect.die(`CloudFront Function '${name}' already exists but could not be recovered`)))), Effect.retry({
                        while: (error) => error._tag === "InvalidArgument" &&
                            isKeyValueStoreAssociationPending(error),
                        schedule: cappedCloudFrontRetrySchedule,
                    }));
                    return created.ETag;
                });
            // Sync — push desired config/code to DEVELOPMENT when the
            // function already existed. Skip when we just created it (the
            // creation already used the desired config).
            let etagToPublish = developmentEtag;
            if (observedDevelopment) {
                const updated = yield* cloudfront
                    .updateFunction({
                    Name: name,
                    IfMatch: observedDevelopment.ETag,
                    FunctionConfig: {
                        Comment: news.comment ?? "",
                        Runtime: news.runtime ??
                            observedDevelopment.FunctionSummary?.FunctionConfig
                                .Runtime ??
                            "cloudfront-js-2.0",
                        KeyValueStoreAssociations: toKvAssociations(news.keyValueStoreArns),
                    },
                    FunctionCode: new TextEncoder().encode(news.code),
                })
                    .pipe(Effect.retry({
                    while: (error) => error._tag === "InvalidArgument" &&
                        isKeyValueStoreAssociationPending(error),
                    schedule: cappedCloudFrontRetrySchedule,
                }));
                etagToPublish = updated.ETag;
            }
            // Publish DEVELOPMENT → LIVE so consumers see the desired code.
            const live = yield* publish(name, etagToPublish);
            if (!live?.FunctionSummary) {
                return yield* Effect.die("publishFunction returned no function summary");
            }
            yield* session.note(name);
            return toAttrs(live.FunctionSummary, live.ETag, name);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* Effect.gen(function* () {
                const developmentEtag = yield* getDevelopmentEtag(output.functionName);
                if (!developmentEtag) {
                    yield* Effect.logInfo(`CloudFront Function delete: ${output.functionName} already absent`);
                    return;
                }
                yield* Effect.logInfo(`CloudFront Function delete: deleting ${output.functionName} stage=DEVELOPMENT etag=${developmentEtag}`);
                yield* cloudfront.deleteFunction({
                    Name: output.functionName,
                    IfMatch: developmentEtag,
                });
            }).pipe(Effect.catchTag("NoSuchFunctionExists", () => Effect.void), Effect.tapError((error) => isFunctionDeletePending(error)
                ? Effect.logInfo(`CloudFront Function delete: ${output.functionName} not ready yet (${error._tag}), retrying with capped exponential backoff`)
                : Effect.logError(`CloudFront Function delete: ${output.functionName} failed with ${String(error)}`)), Effect.retry({
                while: isFunctionDeletePending,
                schedule: cappedCloudFrontRetrySchedule,
            }));
        }),
    };
}));
const isFunctionDeletePending = (error) => error._tag === "FunctionInUse" || error._tag === "PreconditionFailed";
const isKeyValueStoreAssociationPending = (error) => {
    const message = error.message ?? "";
    return (message.includes("KeyValueStoreAssociationArn") &&
        message.includes("cannot be associated before the resource is provisioned"));
};
const cappedCloudFrontRetrySchedule = Schedule.max([
    Schedule.exponential("100 millis"),
    Schedule.recurs(24),
]).pipe(Schedule.modifyDelay(({ duration }) => Effect.succeed(Duration.isGreaterThan(duration, Duration.seconds(2))
    ? Duration.seconds(2)
    : duration)));
const createName = (id, props) => props.name
    ? Effect.succeed(props.name)
    : createPhysicalName({
        id,
        maxLength: 64,
        lowercase: true,
    });
const toKvAssociations = (arns) => arns && arns.length > 0
    ? {
        Quantity: arns.length,
        Items: arns.map((KeyValueStoreARN) => ({ KeyValueStoreARN })),
    }
    : undefined;
const toAttrs = (summary, etag, fallbackName) => ({
    functionArn: summary.FunctionMetadata.FunctionARN,
    functionName: summary.Name || fallbackName,
    runtime: summary.FunctionConfig.Runtime,
    comment: summary.FunctionConfig.Comment ?? "",
    stage: summary.FunctionMetadata.Stage ?? "DEVELOPMENT",
    status: summary.Status ?? "UNKNOWN",
    lastModifiedTime: summary.FunctionMetadata.LastModifiedTime,
    etag,
    keyValueStoreArns: summary.FunctionConfig.KeyValueStoreAssociations?.Items?.flatMap((item) => item.KeyValueStoreARN ? [item.KeyValueStoreARN] : []) ?? [],
});
//# sourceMappingURL=Function.js.map