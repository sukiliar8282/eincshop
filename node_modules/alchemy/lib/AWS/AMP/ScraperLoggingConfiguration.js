import * as amp from "@distilled.cloud/aws/amp";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { normalizeAmpLogGroupArn } from "./internal.js";
/**
 * The logging configuration of an Amazon Managed Service for Prometheus
 * scraper — ships the scraper's component logs (service discovery,
 * collection, export) to a CloudWatch Logs log group. A scraper has at most
 * one.
 *
 * ### Creating a Scraper Logging Configuration
 * **Example:** Ship Scraper Logs to CloudWatch Logs
 * ```typescript
 * const logs = yield* Logs.LogGroup("ScraperLogs", {
 *   logGroupName: "/aws/vendedlogs/prometheus/scraper",
 * });
 * const logging = yield* AMP.ScraperLoggingConfiguration("ScraperLogging", {
 *   scraperId: scraper.scraperId,
 *   logGroupArn: logs.logGroupArn,
 * });
 * ```
 *
 * @resource
 */
export const ScraperLoggingConfiguration = Resource("AWS.AMP.ScraperLoggingConfiguration");
export const ScraperLoggingConfigurationProvider = () => Provider.effect(ScraperLoggingConfiguration, Effect.gen(function* () {
    /** Describe the configuration; typed not-found → undefined. */
    const describe = Effect.fn(function* (scraperId) {
        return yield* amp
            .describeScraperLoggingConfiguration({ scraperId })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    const toAttrs = (config) => ({
        scraperId: config.scraperId,
        logGroupArn: config.loggingDestination.cloudWatchLogs.logGroupArn,
        status: config.status.statusCode,
    });
    /** Canonical component list for observed-vs-desired comparison. */
    const canonicalComponents = (components) => JSON.stringify(components
        .map((component) => ({
        type: component.type,
        options: Object.fromEntries(Object.entries(component.config?.options ?? {})
            .filter((kv) => typeof kv[1] === "string")
            .sort(([a], [b]) => a.localeCompare(b))),
    }))
        .sort((a, b) => a.type.localeCompare(b.type)));
    const toWireComponents = (components) => components?.map((component) => ({
        type: component.type,
        config: component.options !== undefined
            ? { options: component.options }
            : undefined,
    }));
    return {
        stables: ["scraperId"],
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return undefined;
            if (olds?.scraperId !== news.scraperId) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ olds, output }) {
            const scraperId = output?.scraperId ?? olds?.scraperId;
            if (!scraperId)
                return undefined;
            const config = yield* describe(scraperId);
            if (config === undefined)
                return undefined;
            // Scraper logging configurations are not taggable — ownership is
            // implied by the owned parent scraper.
            return toAttrs(config);
        }),
        reconcile: Effect.fn(function* ({ news, session }) {
            const scraperId = news.scraperId;
            const desiredArn = normalizeAmpLogGroupArn(news.logGroupArn);
            const desiredComponents = toWireComponents(news.components);
            // 1. Observe — the live configuration is authoritative.
            const observed = yield* describe(scraperId);
            // 2/3. Ensure + sync — `updateScraperLoggingConfiguration` is an
            // upsert (there is no separate create operation); apply it only
            // when the destination or components drift.
            const drifts = observed === undefined ||
                observed.loggingDestination.cloudWatchLogs.logGroupArn !==
                    desiredArn ||
                (desiredComponents !== undefined &&
                    canonicalComponents(desiredComponents) !==
                        canonicalComponents(observed.scraperComponents));
            if (drifts) {
                yield* amp
                    .updateScraperLoggingConfiguration({
                    scraperId,
                    loggingDestination: {
                        cloudWatchLogs: { logGroupArn: desiredArn },
                    },
                    scraperComponents: desiredComponents,
                })
                    .pipe(
                // The scraper (or a previous logging update) may still be
                // transitioning — retry conflicts briefly.
                Effect.retry({
                    while: (e) => e._tag === "ConflictException",
                    schedule: Schedule.max([
                        Schedule.fixed("6 seconds"),
                        Schedule.recurs(15),
                    ]),
                }));
            }
            // Bounded best-effort wait toward ACTIVE — a still-transitioning
            // configuration converges on a later reconcile.
            const fresh = yield* amp
                .describeScraperLoggingConfiguration({ scraperId })
                .pipe(Effect.repeat({
                schedule: Schedule.max([
                    Schedule.fixed("3 seconds"),
                    Schedule.recurs(20),
                ]),
                until: (c) => c.status.statusCode === "ACTIVE",
            }));
            yield* session.note(scraperId);
            return toAttrs(fresh);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* amp
                .deleteScraperLoggingConfiguration({
                scraperId: output.scraperId,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void), Effect.retry({
                while: (e) => e._tag === "ConflictException",
                schedule: Schedule.max([
                    Schedule.fixed("3 seconds"),
                    Schedule.recurs(20),
                ]),
            }));
        }),
        // Singleton sub-resource keyed by its parent scraper.
        list: () => Effect.succeed([]),
    };
}));
//# sourceMappingURL=ScraperLoggingConfiguration.js.map