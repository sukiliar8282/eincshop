import * as route53 from "@distilled.cloud/aws/route-53";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * DNS query logging for a Route 53 public hosted zone.
 *
 * Route 53 publishes query logs to a CloudWatch Logs log group in
 * `us-east-1`. The log group needs a CloudWatch Logs resource policy (also in
 * `us-east-1`) that allows the `route53.amazonaws.com` service principal to
 * create log streams and put log events — model it with
 * `AWS.Logs.ResourcePolicy`.
 *
 * A hosted zone can have at most one query logging configuration, and the
 * configuration is immutable — changing either property replaces it.
 * ### Enabling Query Logging
 * **Example:** Log Queries for a Hosted Zone
 * ```typescript
 * // Both the log group and the resource policy must live in us-east-1.
 * const policy = yield* Logs.ResourcePolicy("Route53QueryLogging", {
 *   policyName: "route53-query-logging",
 *   policyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { Service: "route53.amazonaws.com" },
 *         Action: ["logs:CreateLogStream", "logs:PutLogEvents"],
 *         Resource: `arn:aws:logs:us-east-1:${accountId}:log-group:/aws/route53/*`,
 *       },
 *     ],
 *   },
 * });
 *
 * const logging = yield* QueryLoggingConfig("ZoneQueryLogging", {
 *   hostedZoneId: zone.id,
 *   cloudWatchLogsLogGroupArn: logGroup.logGroupArn,
 * });
 * ```
 *
 * @resource
 */
export const QueryLoggingConfig = Resource("AWS.Route53.QueryLoggingConfig");
const toAttrs = (config) => ({
    id: config.Id,
    hostedZoneId: config.HostedZoneId,
    cloudWatchLogsLogGroupArn: config.CloudWatchLogsLogGroupArn,
});
/**
 * `createQueryLoggingConfig` validates the CloudWatch Logs resource policy
 * at call time. A policy that was just put (same deploy) can take a few
 * seconds to become visible to Route 53, surfacing as
 * `InsufficientCloudWatchLogsResourcePolicy` — retry it (and
 * `ConcurrentModification`) on a bounded schedule (~40s).
 *
 * Explicitly typed: inlining `Effect.retry` with options in provider
 * lifecycle code can widen the provider layer to `unknown` in declaration
 * emit.
 *
 * @internal
 */
const retryQueryLoggingCreate = (self) => Effect.retry(self, {
    while: (e) => e._tag === "InsufficientCloudWatchLogsResourcePolicy" ||
        e._tag === "ConcurrentModification",
    schedule: Schedule.max([Schedule.fixed("2 seconds"), Schedule.recurs(20)]),
});
export const QueryLoggingConfigProvider = () => Provider.effect(QueryLoggingConfig, Effect.gen(function* () {
    // A hosted zone has at most one query logging configuration, so
    // observing by zone id is exact.
    const observeByZone = Effect.fn(function* (hostedZoneId) {
        const response = yield* route53
            .listQueryLoggingConfigs({
            HostedZoneId: hostedZoneId,
            MaxResults: 1,
        })
            .pipe(Effect.catchTag("NoSuchHostedZone", () => Effect.succeed({ QueryLoggingConfigs: [] })));
        return (response.QueryLoggingConfigs ?? []).at(0);
    });
    const observeById = Effect.fn(function* (id) {
        const response = yield* route53
            .getQueryLoggingConfig({ Id: id })
            .pipe(Effect.catchTag("NoSuchQueryLoggingConfig", () => Effect.succeed(undefined)));
        return response?.QueryLoggingConfig;
    });
    const deleteById = Effect.fn(function* (id) {
        yield* route53
            .deleteQueryLoggingConfig({ Id: id })
            .pipe(Effect.catchTag("NoSuchQueryLoggingConfig", () => Effect.void));
    });
    return {
        stables: ["id", "hostedZoneId", "cloudWatchLogsLogGroupArn"],
        list: () => route53.listQueryLoggingConfigs.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.QueryLoggingConfigs ?? []).map(toAttrs)))),
        // The configuration is immutable (no update API) — any property
        // change replaces it.
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return undefined;
            if (olds.hostedZoneId !== news.hostedZoneId ||
                olds.cloudWatchLogsLogGroupArn !== news.cloudWatchLogsLogGroupArn) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ olds, output }) {
            // Prefer the stored config id; fall back to the zone lookup
            // (state-loss recovery). A half-created state row can't round-trip
            // an Output-valued `hostedZoneId` — report "not found".
            const config = output?.id
                ? yield* observeById(output.id)
                : olds?.hostedZoneId !== undefined
                    ? yield* observeByZone(olds.hostedZoneId)
                    : undefined;
            if (!config) {
                return undefined;
            }
            return toAttrs(config);
        }),
        reconcile: Effect.fn(function* ({ news, session }) {
            // Observe — the zone's (at most one) live configuration.
            let observed = yield* observeByZone(news.hostedZoneId);
            // Sync — the configuration is immutable; an adopted/drifted config
            // pointing at a different log group is converged by delete +
            // recreate (routine prop changes replace via `diff` instead).
            if (observed &&
                observed.CloudWatchLogsLogGroupArn !==
                    news.cloudWatchLogsLogGroupArn) {
                yield* deleteById(observed.Id);
                observed = undefined;
            }
            // Ensure — create when missing. `QueryLoggingConfigAlreadyExists`
            // is a race with a peer reconciler; re-observe.
            if (!observed) {
                observed = yield* retryQueryLoggingCreate(route53.createQueryLoggingConfig({
                    HostedZoneId: news.hostedZoneId,
                    CloudWatchLogsLogGroupArn: news.cloudWatchLogsLogGroupArn,
                })).pipe(Effect.map((response) => response.QueryLoggingConfig), Effect.catchTag("QueryLoggingConfigAlreadyExists", () => observeByZone(news.hostedZoneId).pipe(Effect.flatMap((existing) => existing
                    ? Effect.succeed(existing)
                    : Effect.die(`Route53 query logging config for zone '${news.hostedZoneId}' already exists but could not be observed`)))));
            }
            yield* session.note(observed.Id);
            return toAttrs(observed);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* deleteById(output.id);
        }),
    };
}));
//# sourceMappingURL=QueryLoggingConfig.js.map