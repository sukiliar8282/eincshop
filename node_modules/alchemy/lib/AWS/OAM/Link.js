import * as oam from "@distilled.cloud/aws/oam";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { hasAlchemyTags } from "../../Tags.js";
import { deleteLinkAndWait, readOamTags, retryOamMutation, syncOamTags, } from "./internal.js";
/**
 * A CloudWatch cross-account observability **link** — created in a source
 * account, it attaches to a monitoring-account {@link Sink} and shares the
 * selected telemetry types (metrics, log groups, traces, Application
 * Signals) with that account.
 *
 * The sink must live in a **different** account and its sink policy must
 * authorize this account to link.
 *
 * ### Creating a Link
 * **Example:** Share metrics and logs with a monitoring account
 * ```typescript
 * import * as OAM from "alchemy/AWS/OAM";
 *
 * const link = yield* OAM.Link("ToMonitoring", {
 *   labelTemplate: "$AccountName",
 *   resourceTypes: ["AWS::CloudWatch::Metric", "AWS::Logs::LogGroup"],
 *   sinkIdentifier:
 *     "arn:aws:oam:us-west-2:111122223333:sink/1c72e9ec-4d4a-4e...",
 * });
 * ```
 *
 * **Example:** Filter what is shared
 * ```typescript
 * const link = yield* OAM.Link("FilteredLink", {
 *   labelTemplate: "$AccountName",
 *   resourceTypes: ["AWS::CloudWatch::Metric", "AWS::Logs::LogGroup"],
 *   sinkIdentifier: sinkArn,
 *   linkConfiguration: {
 *     logGroupConfiguration: { filter: "LogGroupName LIKE 'aws/lambda/%'" },
 *     metricConfiguration: { filter: "Namespace NOT LIKE 'AWS/%'" },
 *   },
 * });
 * ```
 *
 * @resource
 */
export const Link = Resource("AWS.OAM.Link");
const toLinkConfiguration = (config) => config === undefined
    ? undefined
    : {
        ...(config.logGroupConfiguration
            ? {
                LogGroupConfiguration: {
                    Filter: config.logGroupConfiguration.filter,
                },
            }
            : {}),
        ...(config.metricConfiguration
            ? {
                MetricConfiguration: {
                    Filter: config.metricConfiguration.filter,
                },
            }
            : {}),
    };
const sameResourceTypes = (a, b) => JSON.stringify([...(a ?? [])].sort()) ===
    JSON.stringify([...(b ?? [])].sort());
const sameLinkConfiguration = (a, b) => (a?.LogGroupConfiguration?.Filter ?? null) ===
    (b?.LogGroupConfiguration?.Filter ?? null) &&
    (a?.MetricConfiguration?.Filter ?? null) ===
        (b?.MetricConfiguration?.Filter ?? null);
export const LinkProvider = () => Provider.effect(Link, Effect.gen(function* () {
    const getLinkByArn = Effect.fn(function* (linkArn) {
        return yield* oam
            .getLink({ Identifier: linkArn })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    return Link.Provider.of({
        stables: ["linkArn", "linkId", "label", "sinkArn"],
        list: () => oam.listLinks.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.Items.filter((item) => item.Arn != null && item.Id != null).map((item) => ({
            linkArn: item.Arn,
            linkId: item.Id,
            label: item.Label ?? "",
            sinkArn: item.SinkArn ?? "",
        }))))),
        read: Effect.fn(function* ({ id, output }) {
            // Links are identified by an auto-assigned ARN. With a cached ARN
            // we look it up directly; without one (state persistence failed
            // before the ARN landed) we scan the account's links for the one
            // carrying our ownership tags.
            if (output?.linkArn) {
                const found = yield* getLinkByArn(output.linkArn);
                if (!found?.Arn)
                    return undefined;
                return {
                    linkArn: found.Arn,
                    linkId: found.Id,
                    label: found.Label ?? "",
                    sinkArn: found.SinkArn ?? "",
                };
            }
            const pages = yield* oam.listLinks.pages({}).pipe(Stream.runCollect);
            const items = Array.from(pages).flatMap((page) => page.Items);
            for (const item of items) {
                if (item.Arn == null)
                    continue;
                const tags = yield* readOamTags(item.Arn);
                if (yield* hasAlchemyTags(id, tags)) {
                    return {
                        linkArn: item.Arn,
                        linkId: item.Id,
                        label: item.Label ?? "",
                        sinkArn: item.SinkArn ?? "",
                    };
                }
            }
            return undefined;
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            // The label template and the target sink are immutable —
            // UpdateLink only changes resource types and filters.
            if (news.labelTemplate !== olds.labelTemplate) {
                return { action: "replace" };
            }
            if (news.sinkIdentifier !== olds.sinkIdentifier) {
                return { action: "replace" };
            }
            return undefined;
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const desiredConfiguration = toLinkConfiguration(news.linkConfiguration);
            // OBSERVE — the cached ARN is only a hint; a deleted link falls
            // through to create.
            let live = output?.linkArn
                ? yield* getLinkByArn(output.linkArn)
                : undefined;
            // ENSURE
            if (live?.Arn == null) {
                live = yield* retryOamMutation(oam.createLink({
                    LabelTemplate: news.labelTemplate,
                    ResourceTypes: news.resourceTypes,
                    SinkIdentifier: news.sinkIdentifier,
                    LinkConfiguration: desiredConfiguration,
                    Tags: news.tags,
                }));
            }
            const linkArn = live.Arn;
            // SYNC — resource types + filters, diffed against observed state.
            if (!sameResourceTypes(live.ResourceTypes, news.resourceTypes) ||
                !sameLinkConfiguration(live.LinkConfiguration, desiredConfiguration)) {
                live = yield* retryOamMutation(oam.updateLink({
                    Identifier: linkArn,
                    ResourceTypes: news.resourceTypes,
                    LinkConfiguration: desiredConfiguration,
                }));
            }
            // SYNC tags — against observed cloud tags (adoption-safe).
            yield* syncOamTags(linkArn, id, news.tags);
            yield* session.note(linkArn);
            return {
                linkArn,
                linkId: live.Id,
                label: live.Label ?? "",
                sinkArn: live.SinkArn ?? "",
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* deleteLinkAndWait(output.linkArn);
        }),
    });
}));
//# sourceMappingURL=Link.js.map