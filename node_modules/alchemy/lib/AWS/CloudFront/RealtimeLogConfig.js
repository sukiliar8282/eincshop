import * as cloudfront from "@distilled.cloud/aws/cloudfront";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * A CloudFront real-time log configuration.
 *
 * Real-time logs deliver per-request records to a Kinesis data stream within
 * seconds. Attach the configuration to a distribution's cache behavior via
 * `Distribution` (`realtimeLogConfigArn`).
 * ### Creating Real-Time Log Configs
 * **Example:** Stream Viewer Requests to Kinesis
 * ```typescript
 * const stream = yield* Kinesis.Stream("EdgeLogs", {});
 *
 * const role = yield* IAM.Role("EdgeLogsRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { Service: "cloudfront.amazonaws.com" },
 *         Action: "sts:AssumeRole",
 *       },
 *     ],
 *   },
 *   inlinePolicies: {
 *     kinesis: {
 *       Version: "2012-10-17",
 *       Statement: [
 *         {
 *           Effect: "Allow",
 *           Action: [
 *             "kinesis:DescribeStreamSummary",
 *             "kinesis:DescribeStream",
 *             "kinesis:PutRecord",
 *             "kinesis:PutRecords",
 *           ],
 *           Resource: stream.streamArn,
 *         },
 *       ],
 *     },
 *   },
 * });
 *
 * const logConfig = yield* RealtimeLogConfig("EdgeLogConfig", {
 *   samplingRate: 100,
 *   fields: ["timestamp", "c-ip", "cs-uri-stem", "sc-status"],
 *   endpoints: [{ streamArn: stream.streamArn, roleArn: role.roleArn }],
 * });
 * ```
 *
 * @resource
 */
export const RealtimeLogConfig = Resource("AWS.CloudFront.RealtimeLogConfig");
const createName = (id, props) => props.name
    ? Effect.succeed(props.name)
    : createPhysicalName({ id, maxLength: 64 });
const toEndPoints = (endpoints) => endpoints.map((endpoint) => ({
    StreamType: "Kinesis",
    KinesisStreamConfig: {
        RoleARN: endpoint.roleArn,
        StreamARN: endpoint.streamArn,
    },
}));
const fromEndPoints = (endpoints) => (endpoints ?? []).flatMap((endpoint) => endpoint.KinesisStreamConfig
    ? [
        {
            streamArn: endpoint.KinesisStreamConfig.StreamARN,
            roleArn: endpoint.KinesisStreamConfig.RoleARN,
        },
    ]
    : []);
const toAttrs = (config) => ({
    arn: config.ARN,
    name: config.Name,
    samplingRate: config.SamplingRate,
    fields: [...config.Fields],
    endpoints: fromEndPoints([...config.EndPoints]),
});
const sameEndpoints = (a, b) => a.length === b.length &&
    a.every((endpoint, index) => endpoint.streamArn === b[index]?.streamArn &&
        endpoint.roleArn === b[index]?.roleArn);
// CloudFront canonicalizes (reorders) the field list, so compare as sets.
const sameFields = (a, b) => {
    if (a.length !== b.length)
        return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((field, index) => field === sortedB[index]);
};
/**
 * CloudFront validates at create/update time that it can assume the
 * endpoint's IAM role. A role created in the same deploy can take a few
 * seconds to propagate through IAM, surfacing as `InvalidArgument` — retry
 * it on a bounded schedule (~40s). Genuine validation errors fail after the
 * cap.
 *
 * Explicitly typed: inlining `Effect.retry` with options in provider
 * lifecycle code can widen the provider layer to `unknown` in declaration
 * emit.
 *
 * @internal
 */
const retryIamPropagation = (self) => Effect.retry(self, {
    while: (e) => e._tag === "InvalidArgument",
    schedule: Schedule.max([Schedule.fixed("2 seconds"), Schedule.recurs(20)]),
});
/**
 * Deleting a config shortly after a distribution stopped referencing it can
 * surface `RealtimeLogConfigInUse` until the distribution update propagates
 * — retry on a bounded schedule (~40s).
 *
 * @internal
 */
const retryConfigInUse = (self) => Effect.retry(self, {
    while: (e) => e._tag === "RealtimeLogConfigInUse",
    schedule: Schedule.max([Schedule.fixed("2 seconds"), Schedule.recurs(20)]),
});
export const RealtimeLogConfigProvider = () => Provider.effect(RealtimeLogConfig, Effect.gen(function* () {
    const observe = Effect.fn(function* (name) {
        const response = yield* cloudfront
            .getRealtimeLogConfig({ Name: name })
            .pipe(Effect.catchTag("NoSuchRealtimeLogConfig", () => Effect.succeed(undefined)));
        return response?.RealtimeLogConfig;
    });
    return {
        stables: ["arn", "name"],
        // Enumerate every config in the account. `listRealtimeLogConfigs`
        // pages via Marker/NextMarker inside a wrapper struct (no distilled
        // paginator) — hand-roll a bounded loop; an empty NextMarker is
        // terminal.
        list: () => Effect.gen(function* () {
            const items = [];
            let marker;
            for (let page = 0; page < 20; page++) {
                const response = yield* cloudfront.listRealtimeLogConfigs({
                    Marker: marker,
                    MaxItems: 100,
                });
                for (const config of response.RealtimeLogConfigs?.Items ?? []) {
                    items.push(toAttrs(config));
                }
                if (!response.RealtimeLogConfigs?.NextMarker) {
                    break;
                }
                marker = response.RealtimeLogConfigs.NextMarker;
            }
            return items;
        }),
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            if ((yield* createName(id, olds)) !== (yield* createName(id, news))) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.name ??
                (yield* createName(id, olds ?? {}));
            const observed = yield* observe(name);
            if (!observed) {
                return undefined;
            }
            return toAttrs(observed);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.name ?? (yield* createName(id, news));
            const desiredEndpoints = news.endpoints;
            const desiredFields = news.fields;
            // Observe — live config is authoritative; `output` only caches the
            // name.
            let observed = yield* observe(name);
            // Ensure — create when missing; `RealtimeLogConfigAlreadyExists`
            // is a race with a peer reconciler, re-observe.
            if (!observed) {
                observed = yield* retryIamPropagation(cloudfront.createRealtimeLogConfig({
                    Name: name,
                    SamplingRate: news.samplingRate,
                    Fields: desiredFields,
                    EndPoints: toEndPoints(desiredEndpoints),
                })).pipe(Effect.map((response) => response.RealtimeLogConfig), Effect.catchTag("RealtimeLogConfigAlreadyExists", () => observe(name)));
                if (!observed) {
                    return yield* Effect.die(`CloudFront RealtimeLogConfig '${name}' could not be observed after create`);
                }
                yield* session.note(observed.ARN);
                return toAttrs(observed);
            }
            // Sync — `updateRealtimeLogConfig` replaces every mutable aspect
            // at once; skip the call entirely when observed matches desired.
            const current = toAttrs(observed);
            if (current.samplingRate !== news.samplingRate ||
                !sameFields(current.fields, desiredFields) ||
                !sameEndpoints(current.endpoints, desiredEndpoints)) {
                const updated = yield* retryIamPropagation(cloudfront.updateRealtimeLogConfig({
                    Name: name,
                    SamplingRate: news.samplingRate,
                    Fields: desiredFields,
                    EndPoints: toEndPoints(desiredEndpoints),
                }));
                if (updated.RealtimeLogConfig) {
                    observed = updated.RealtimeLogConfig;
                }
            }
            yield* session.note(observed.ARN);
            return toAttrs(observed);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* retryConfigInUse(cloudfront
                .deleteRealtimeLogConfig({ Name: output.name })
                .pipe(Effect.asVoid)).pipe(Effect.catchTag("NoSuchRealtimeLogConfig", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=RealtimeLogConfig.js.map