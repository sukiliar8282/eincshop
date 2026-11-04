import * as vpclattice from "@distilled.cloud/aws/vpc-lattice";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags, tagRecord, } from "../../Tags.js";
import { retryOnConflict, waitUntilAbsent } from "./internal.js";
/**
 * An Amazon VPC Lattice listener rule — matches HTTP requests by method,
 * path, or headers and forwards them to target groups (or answers with a
 * fixed response), evaluated in priority order before the listener's default
 * action.
 *
 * ### Creating Rules
 * **Example:** Path-Prefix Rule Forwarding to a Target Group
 * ```typescript
 * const rule = yield* Rule("ApiRule", {
 *   serviceIdentifier: service.serviceId,
 *   listenerIdentifier: listener.listenerId,
 *   priority: 10,
 *   match: { httpMatch: { pathMatch: { match: { prefix: "/api" } } } },
 *   action: {
 *     forward: {
 *       targetGroups: [
 *         { targetGroupIdentifier: targets.targetGroupId, weight: 100 },
 *       ],
 *     },
 *   },
 * });
 * ```
 *
 * **Example:** Method Match with a Fixed Response
 * ```typescript
 * const rule = yield* Rule("BlockDeletes", {
 *   serviceIdentifier: service.serviceId,
 *   listenerIdentifier: listener.listenerId,
 *   priority: 1,
 *   match: { httpMatch: { method: "DELETE" } },
 *   action: { fixedResponse: { statusCode: 403 } },
 * });
 * ```
 *
 * @resource
 */
export const Rule = Resource("AWS.VpcLattice.Rule");
export const RuleProvider = () => Provider.effect(Rule, Effect.gen(function* () {
    const toName = (id, props = {}) => props.name
        ? Effect.succeed(props.name)
        : createPhysicalName({ id, maxLength: 63, lowercase: true });
    const observe = (serviceIdentifier, listenerIdentifier, ruleIdentifier) => vpclattice
        .getRule({ serviceIdentifier, listenerIdentifier, ruleIdentifier })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    const findByName = (serviceIdentifier, listenerIdentifier, name) => vpclattice.listRules
        .pages({ serviceIdentifier, listenerIdentifier })
        .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
        .flatMap((page) => page.items ?? [])
        .find((r) => r.name === name)), Effect.flatMap((summary) => summary?.id
        ? observe(serviceIdentifier, listenerIdentifier, summary.id)
        : Effect.succeed(undefined)))
        .pipe(
    // The owning listener/service may already be gone during
    // teardown races.
    Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    const syncTags = Effect.fn(function* (arn, desiredTags) {
        const listed = yield* vpclattice.listTagsForResource({
            resourceArn: arn,
        });
        const { removed, upsert } = diffTags(tagRecord(listed.tags), desiredTags);
        if (upsert.length > 0) {
            yield* vpclattice.tagResource({
                resourceArn: arn,
                tags: Object.fromEntries(upsert.map((t) => [t.Key, t.Value])),
            });
        }
        if (removed.length > 0) {
            yield* vpclattice.untagResource({
                resourceArn: arn,
                tagKeys: removed,
            });
        }
    });
    return {
        stables: [
            "ruleId",
            "ruleArn",
            "name",
            "serviceIdentifier",
            "listenerIdentifier",
        ],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return;
            if ((yield* toName(id, olds ?? {})) !== (yield* toName(id, news ?? {}))) {
                return { action: "replace" };
            }
            if (olds?.serviceIdentifier !== news.serviceIdentifier ||
                olds?.listenerIdentifier !== news.listenerIdentifier) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const serviceIdentifier = output?.serviceIdentifier ?? olds?.serviceIdentifier;
            const listenerIdentifier = output?.listenerIdentifier ?? olds?.listenerIdentifier;
            if (!serviceIdentifier || !listenerIdentifier)
                return undefined;
            const rule = output?.ruleId
                ? yield* observe(serviceIdentifier, listenerIdentifier, output.ruleId)
                : yield* findByName(serviceIdentifier, listenerIdentifier, yield* toName(id, olds ?? {}));
            if (!rule?.arn || !rule.id)
                return undefined;
            const listed = yield* vpclattice.listTagsForResource({
                resourceArn: rule.arn,
            });
            const attrs = {
                ruleId: rule.id,
                ruleArn: rule.arn,
                name: rule.name,
                priority: rule.priority ?? 0,
                serviceIdentifier,
                listenerIdentifier,
                tags: tagRecord(listed.tags),
            };
            return (yield* hasAlchemyTags(id, listed.tags))
                ? attrs
                : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = yield* toName(id, news);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // Observe — prefer the stable id cache, fall back to name lookup.
            let rule = output?.ruleId
                ? yield* observe(news.serviceIdentifier, news.listenerIdentifier, output.ruleId)
                : yield* findByName(news.serviceIdentifier, news.listenerIdentifier, name);
            // Ensure — create if missing.
            if (!rule?.arn || !rule.id) {
                rule = yield* retryOnConflict(vpclattice.createRule({
                    serviceIdentifier: news.serviceIdentifier,
                    listenerIdentifier: news.listenerIdentifier,
                    name,
                    match: news.match,
                    priority: news.priority,
                    action: news.action,
                })).pipe(Effect.catchTag("ConflictException", () => findByName(news.serviceIdentifier, news.listenerIdentifier, name)));
                if (!rule?.arn || !rule.id) {
                    return yield* Effect.fail(new Error(`Failed to create rule ${name}`));
                }
            }
            else if (JSON.stringify(rule.match) !== JSON.stringify(news.match) ||
                rule.priority !== news.priority ||
                JSON.stringify(rule.action) !== JSON.stringify(news.action)) {
                // Sync match/priority/action — all mutable in place.
                yield* retryOnConflict(vpclattice.updateRule({
                    serviceIdentifier: news.serviceIdentifier,
                    listenerIdentifier: news.listenerIdentifier,
                    ruleIdentifier: rule.id,
                    match: news.match,
                    priority: news.priority,
                    action: news.action,
                }));
            }
            yield* syncTags(rule.arn, desiredTags);
            yield* session.note(rule.arn);
            return {
                ruleId: rule.id,
                ruleArn: rule.arn,
                name,
                priority: news.priority,
                serviceIdentifier: news.serviceIdentifier,
                listenerIdentifier: news.listenerIdentifier,
                tags: desiredTags,
            };
        }),
        // Sub-resource: rules are keyed by their owning service/listener and
        // are removed with them, so nuke has nothing to enumerate.
        list: () => Effect.succeed([]),
        delete: Effect.fn(function* ({ output }) {
            yield* retryOnConflict(vpclattice.deleteRule({
                serviceIdentifier: output.serviceIdentifier,
                listenerIdentifier: output.listenerIdentifier,
                ruleIdentifier: output.ruleId,
            })).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            yield* waitUntilAbsent(observe(output.serviceIdentifier, output.listenerIdentifier, output.ruleId));
        }),
    };
}));
//# sourceMappingURL=Rule.js.map