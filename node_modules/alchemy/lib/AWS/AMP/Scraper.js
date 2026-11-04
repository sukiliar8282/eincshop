import * as amp from "@distilled.cloud/aws/amp";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { decodeDefinition, encodeDefinition, syncAmpTags, toTagRecord, } from "./internal.js";
/**
 * An Amazon Managed Service for Prometheus scraper — a fully-managed,
 * agentless collector that pulls metrics from an Amazon EKS cluster (or a
 * VPC-based Prometheus-compatible source) and remote-writes them into an AMP
 * workspace.
 *
 * Scraper provisioning is slow (the service creates network interfaces and
 * an IAM role; expect several minutes to reach `ACTIVE`).
 *
 * ### Creating a Scraper
 * **Example:** Scrape an EKS Cluster into a Workspace
 * ```typescript
 * const workspace = yield* AMP.Workspace("Metrics", {});
 * const scraper = yield* AMP.Scraper("ClusterScraper", {
 *   alias: "eks-metrics",
 *   scrapeConfiguration: defaultScrapeConfigYaml,
 *   source: {
 *     eksConfiguration: {
 *       clusterArn: cluster.clusterArn,
 *       subnetIds: [subnetA.subnetId, subnetB.subnetId],
 *     },
 *   },
 *   destinationWorkspaceArn: workspace.workspaceArn,
 * });
 * ```
 *
 * **Example:** Scrape a VPC-Based Source
 * ```typescript
 * const scraper = yield* AMP.Scraper("VpcScraper", {
 *   scrapeConfiguration: scrapeConfigYaml,
 *   source: {
 *     vpcConfiguration: {
 *       subnetIds: [subnet.subnetId],
 *       securityGroupIds: [securityGroup.securityGroupId],
 *     },
 *   },
 *   destinationWorkspaceArn: workspace.workspaceArn,
 * });
 * ```
 *
 * @resource
 */
export const Scraper = Resource("AWS.AMP.Scraper");
/** Canonical JSON of a scraper source for observed-vs-desired comparison. */
const canonicalSource = (source) => {
    const canonical = (config) => ({
        clusterArn: config.clusterArn ?? null,
        subnetIds: [...config.subnetIds].sort(),
        securityGroupIds: [...(config.securityGroupIds ?? [])].sort(),
    });
    return "eksConfiguration" in source
        ? JSON.stringify({ eks: canonical(source.eksConfiguration) })
        : JSON.stringify({ vpc: canonical(source.vpcConfiguration) });
};
export const ScraperProvider = () => Provider.effect(Scraper, Effect.gen(function* () {
    const toAttrs = (scraper) => ({
        scraperId: scraper.scraperId,
        scraperArn: scraper.arn,
        roleArn: scraper.roleArn,
        alias: scraper.alias,
        status: scraper.status.statusCode,
    });
    /** Describe a scraper by id; typed not-found → undefined. */
    const describe = Effect.fn(function* (scraperId) {
        const response = yield* amp
            .describeScraper({ scraperId })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        return response?.scraper;
    });
    const toWireSource = (source) => "eksConfiguration" in source
        ? {
            eksConfiguration: {
                clusterArn: source.eksConfiguration.clusterArn,
                subnetIds: source.eksConfiguration.subnetIds,
                securityGroupIds: source.eksConfiguration.securityGroupIds,
            },
        }
        : {
            vpcConfiguration: {
                subnetIds: source.vpcConfiguration.subnetIds,
                securityGroupIds: source.vpcConfiguration.securityGroupIds,
            },
        };
    /**
     * Poll until the scraper leaves CREATING/UPDATING. Scraper
     * provisioning creates network interfaces in each subnet and can take
     * many minutes — the wait is bounded at 25 minutes and fails fast on a
     * *_FAILED terminal status.
     */
    const waitActive = Effect.fn(function* (scraperId) {
        const scraper = yield* amp.describeScraper({ scraperId }).pipe(Effect.map((r) => r.scraper), Effect.repeat({
            schedule: Schedule.max([
                Schedule.fixed("15 seconds"),
                Schedule.recurs(100),
            ]),
            until: (s) => s.status.statusCode !== "CREATING" &&
                s.status.statusCode !== "UPDATING",
        }));
        if (scraper.status.statusCode !== "ACTIVE") {
            return yield* Effect.fail(new Error(`AMP scraper ${scraperId} did not become ACTIVE (status: ${scraper.status.statusCode}${scraper.statusReason ? `: ${scraper.statusReason}` : ""})`));
        }
        return scraper;
    });
    return {
        stables: ["scraperId", "scraperArn", "roleArn"],
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return undefined;
            // The metric source is immutable — a change replaces the scraper.
            if (olds !== undefined &&
                canonicalSource(olds.source) !== canonicalSource(news.source)) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, output }) {
            // Scraper ids are server-assigned; without an output cache there
            // is no deterministic identity to look up.
            if (!output?.scraperId)
                return undefined;
            const scraper = yield* describe(output.scraperId);
            if (scraper === undefined)
                return undefined;
            const attrs = toAttrs(scraper);
            const tags = toTagRecord(scraper.tags);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            const desiredConfig = news.scrapeConfiguration;
            // 1. Observe — cloud state is authoritative; output is an id cache.
            let scraper = output?.scraperId !== undefined
                ? yield* describe(output.scraperId)
                : undefined;
            // 2. Ensure — create if missing, then wait for ACTIVE.
            if (scraper === undefined) {
                const created = yield* amp.createScraper({
                    alias: news.alias,
                    scrapeConfiguration: {
                        configurationBlob: yield* encodeDefinition(desiredConfig),
                    },
                    source: toWireSource(news.source),
                    destination: {
                        ampConfiguration: {
                            workspaceArn: news.destinationWorkspaceArn,
                        },
                    },
                    roleConfiguration: news.roleConfiguration,
                    tags: desiredTags,
                });
                scraper = yield* waitActive(created.scraperId);
            }
            const scraperId = scraper.scraperId;
            // 3. Sync mutable aspects — diff OBSERVED state against desired
            // and issue a single update only when something drifted.
            const observedConfig = yield* decodeDefinition(scraper.scrapeConfiguration.configurationBlob);
            const observedDestination = scraper.destination.ampConfiguration?.workspaceArn;
            const aliasDrifts = (news.alias ?? undefined) !== (scraper.alias ?? undefined);
            const configDrifts = observedConfig !== desiredConfig;
            const destinationDrifts = observedDestination !== news.destinationWorkspaceArn;
            const roleDrifts = news.roleConfiguration !== undefined &&
                ((news.roleConfiguration.sourceRoleArn ?? undefined) !==
                    (scraper.roleConfiguration?.sourceRoleArn ?? undefined) ||
                    (news.roleConfiguration.targetRoleArn ?? undefined) !==
                        (scraper.roleConfiguration?.targetRoleArn ?? undefined));
            if (aliasDrifts || configDrifts || destinationDrifts || roleDrifts) {
                yield* amp.updateScraper({
                    scraperId,
                    alias: news.alias,
                    scrapeConfiguration: configDrifts
                        ? {
                            configurationBlob: yield* encodeDefinition(desiredConfig),
                        }
                        : undefined,
                    destination: destinationDrifts
                        ? {
                            ampConfiguration: {
                                workspaceArn: news.destinationWorkspaceArn,
                            },
                        }
                        : undefined,
                    roleConfiguration: roleDrifts
                        ? news.roleConfiguration
                        : undefined,
                });
                scraper = yield* waitActive(scraperId);
            }
            // 3b. Sync tags — diff against OBSERVED cloud tags.
            yield* syncAmpTags(scraper.arn, desiredTags);
            yield* session.note(scraperId);
            return toAttrs(scraper);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* amp.deleteScraper({ scraperId: output.scraperId }).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void), 
            // A scraper mid-transition rejects deletion; retry briefly.
            Effect.retry({
                while: (e) => e._tag === "ConflictException",
                schedule: Schedule.max([
                    Schedule.fixed("10 seconds"),
                    Schedule.recurs(30),
                ]),
            }));
        }),
        list: () => amp.listScrapers.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.scrapers.map((summary) => toAttrs(summary))))),
    };
}));
//# sourceMappingURL=Scraper.js.map