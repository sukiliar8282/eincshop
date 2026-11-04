import * as macie2 from "@distilled.cloud/aws/macie2";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags, tagRecord, } from "../../Tags.js";
import { retryThroughEnablement } from "./common.js";
/**
 * An Amazon Macie findings filter — matches findings against criteria and
 * either keeps (`NOOP`) or auto-suppresses (`ARCHIVE`) them. Requires Macie to
 * be enabled for the account (see `Macie2.Session`). Name, description,
 * action, position, and criteria are all updatable in place.
 *
 * ### Filtering findings
 * **Example:** Suppress low-severity findings
 * ```typescript
 * const filter = yield* Macie2.FindingsFilter("LowSeverity", {
 *   action: "ARCHIVE",
 *   position: 1,
 *   findingCriteria: {
 *     criterion: { "severity.description": { eq: ["Low"] } },
 *   },
 * });
 * ```
 *
 * **Example:** Keep a named filter for the console
 * ```typescript
 * const filter = yield* Macie2.FindingsFilter("ProdBuckets", {
 *   name: "prod-buckets-only",
 *   description: "Findings on production buckets",
 *   findingCriteria: {
 *     criterion: {
 *       "resourcesAffected.s3Bucket.name": { eq: ["prod-data"] },
 *     },
 *   },
 * });
 * ```
 */
const FindingsFilterResource = Resource("AWS.Macie2.FindingsFilter");
export { FindingsFilterResource as FindingsFilter };
const createName = (id, props) => props.name
    ? Effect.succeed(props.name)
    : createPhysicalName({ id, maxLength: 64 });
const buildFilterAttrs = (id, live) => ({
    id,
    arn: live.arn,
    name: live.name,
    action: live.action,
});
export const FindingsFilterProvider = () => Provider.effect(FindingsFilterResource, Effect.gen(function* () {
    const getFilter = (id) => macie2.getFindingsFilter({ id }).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)), 
    // Macie disabled ⇒ the filter is unreachable (and disabling deletes
    // all Macie configuration), so report it as gone.
    Effect.catchTag("AccessDeniedException", () => Effect.succeed(undefined)));
    return {
        stables: ["id", "arn"],
        read: Effect.fn(function* ({ id, output }) {
            if (!output?.id)
                return undefined;
            const live = yield* getFilter(output.id);
            if (!live)
                return undefined;
            const attrs = buildFilterAttrs(output.id, live);
            return (yield* hasAlchemyTags(id, live.tags))
                ? attrs
                : Unowned(attrs);
        }),
        list: () => Effect.gen(function* () {
            const pages = yield* macie2.listFindingsFilters.pages({}).pipe(Stream.runCollect, Effect.catchTag("AccessDeniedException", () => Effect.succeed([])));
            const out = [];
            for (const page of pages) {
                for (const summary of page.findingsFilterListItems ?? []) {
                    const live = yield* getFilter(summary.id);
                    if (live)
                        out.push(buildFilterAttrs(summary.id, live));
                }
            }
            return out;
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            const name = news.name ?? (yield* createName(id, news));
            const desiredAction = news.action ?? "NOOP";
            // 1. OBSERVE — cloud state is authoritative; output caches the id.
            let filterId = output?.id;
            let live = filterId ? yield* getFilter(filterId) : undefined;
            if (!live || filterId === undefined) {
                // 2. ENSURE — create the filter (retry through enablement lag).
                const created = yield* retryThroughEnablement(macie2.createFindingsFilter({
                    name,
                    description: news.description,
                    action: desiredAction,
                    position: news.position,
                    findingCriteria: news.findingCriteria,
                    tags: desiredTags,
                }));
                filterId = created.id;
            }
            else {
                // 3. SYNC settings — observed ↔ desired.
                const drift = live.name !== name ||
                    live.action !== desiredAction ||
                    (news.description !== undefined &&
                        live.description !== news.description) ||
                    (news.position !== undefined &&
                        live.position !== news.position) ||
                    JSON.stringify(live.findingCriteria) !==
                        JSON.stringify(news.findingCriteria);
                if (drift) {
                    yield* macie2.updateFindingsFilter({
                        id: filterId,
                        name,
                        description: news.description,
                        action: desiredAction,
                        position: news.position,
                        findingCriteria: news.findingCriteria,
                    });
                }
                // 3b. SYNC tags — diff against OBSERVED cloud tags.
                const { upsert, removed } = diffTags(tagRecord(live.tags), desiredTags);
                if (upsert.length > 0) {
                    yield* macie2.tagResource({
                        resourceArn: live.arn,
                        tags: Object.fromEntries(upsert.map((t) => [t.Key, t.Value])),
                    });
                }
                if (removed.length > 0) {
                    yield* macie2.untagResource({
                        resourceArn: live.arn,
                        tagKeys: removed,
                    });
                }
            }
            // 4. RETURN fresh attributes.
            const final = yield* macie2.getFindingsFilter({ id: filterId });
            yield* session.note(filterId);
            return buildFilterAttrs(filterId, final);
        }),
        delete: Effect.fn(function* ({ output }) {
            // Idempotent — the filter may already be gone, or Macie may already
            // be disabled for the account.
            yield* macie2.deleteFindingsFilter({ id: output.id }).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void), Effect.catchTag("AccessDeniedException", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=FindingsFilter.js.map