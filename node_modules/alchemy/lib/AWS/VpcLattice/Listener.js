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
 * An Amazon VPC Lattice listener — the process on a lattice service that
 * checks for connection requests on a protocol/port and routes them via its
 * default action and rules.
 *
 * ### Creating Listeners
 * **Example:** HTTP Listener with a Fixed Default Response
 * ```typescript
 * const listener = yield* Listener("HttpListener", {
 *   serviceIdentifier: service.serviceId,
 *   protocol: "HTTP",
 *   port: 80,
 *   defaultAction: { fixedResponse: { statusCode: 404 } },
 * });
 * ```
 *
 * **Example:** Listener Forwarding to a Target Group
 * ```typescript
 * const listener = yield* Listener("ApiListener", {
 *   serviceIdentifier: service.serviceId,
 *   protocol: "HTTP",
 *   defaultAction: {
 *     forward: {
 *       targetGroups: [
 *         { targetGroupIdentifier: targets.targetGroupId, weight: 100 },
 *       ],
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export const Listener = Resource("AWS.VpcLattice.Listener");
export const ListenerProvider = () => Provider.effect(Listener, Effect.gen(function* () {
    const toName = (id, props = {}) => props.name
        ? Effect.succeed(props.name)
        : createPhysicalName({ id, maxLength: 63, lowercase: true });
    const observe = (serviceIdentifier, listenerIdentifier) => vpclattice
        .getListener({ serviceIdentifier, listenerIdentifier })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    const findByName = (serviceIdentifier, name) => vpclattice.listListeners
        .pages({ serviceIdentifier })
        .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
        .flatMap((page) => page.items ?? [])
        .find((l) => l.name === name)), Effect.flatMap((summary) => summary?.id
        ? observe(serviceIdentifier, summary.id)
        : Effect.succeed(undefined)))
        .pipe(
    // The owning service may already be gone during teardown races.
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
            "listenerId",
            "listenerArn",
            "name",
            "serviceId",
            "serviceArn",
        ],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return;
            if ((yield* toName(id, olds ?? {})) !== (yield* toName(id, news ?? {}))) {
                return { action: "replace" };
            }
            if (olds?.serviceIdentifier !== news.serviceIdentifier ||
                olds?.protocol !== news.protocol ||
                (olds?.port ?? undefined) !== news.port) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const serviceIdentifier = output?.serviceId ?? olds?.serviceIdentifier;
            if (!serviceIdentifier)
                return undefined;
            const listener = output?.listenerId
                ? yield* observe(serviceIdentifier, output.listenerId)
                : yield* findByName(serviceIdentifier, yield* toName(id, olds ?? {}));
            if (!listener?.arn || !listener.id || !listener.serviceId) {
                return undefined;
            }
            const listed = yield* vpclattice.listTagsForResource({
                resourceArn: listener.arn,
            });
            const attrs = {
                listenerId: listener.id,
                listenerArn: listener.arn,
                name: listener.name,
                protocol: listener.protocol ?? "HTTP",
                port: listener.port,
                serviceId: listener.serviceId,
                serviceArn: listener.serviceArn,
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
            let listener = output?.listenerId
                ? yield* observe(news.serviceIdentifier, output.listenerId)
                : yield* findByName(news.serviceIdentifier, name);
            // Ensure — create if missing.
            if (!listener?.arn || !listener.id) {
                listener = yield* retryOnConflict(vpclattice.createListener({
                    serviceIdentifier: news.serviceIdentifier,
                    name,
                    protocol: news.protocol,
                    port: news.port,
                    defaultAction: news.defaultAction,
                })).pipe(Effect.catchTag("ConflictException", () => findByName(news.serviceIdentifier, name)));
                if (!listener?.arn || !listener.id) {
                    return yield* Effect.fail(new Error(`Failed to create listener ${name}`));
                }
            }
            else if (JSON.stringify(listener.defaultAction) !==
                JSON.stringify(news.defaultAction)) {
                // Sync default action — the only mutable setting.
                yield* retryOnConflict(vpclattice.updateListener({
                    serviceIdentifier: news.serviceIdentifier,
                    listenerIdentifier: listener.id,
                    defaultAction: news.defaultAction,
                }));
            }
            yield* syncTags(listener.arn, desiredTags);
            yield* session.note(listener.arn);
            return {
                listenerId: listener.id,
                listenerArn: listener.arn,
                name,
                protocol: listener.protocol ?? news.protocol,
                port: listener.port,
                serviceId: listener.serviceId ?? news.serviceIdentifier,
                serviceArn: listener.serviceArn,
                tags: desiredTags,
            };
        }),
        // Sub-resource: listeners are keyed by their owning lattice service
        // and are removed with it, so nuke has nothing to enumerate.
        list: () => Effect.succeed([]),
        delete: Effect.fn(function* ({ output }) {
            yield* retryOnConflict(vpclattice.deleteListener({
                serviceIdentifier: output.serviceId,
                listenerIdentifier: output.listenerId,
            })).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            yield* waitUntilAbsent(observe(output.serviceId, output.listenerId));
        }),
    };
}));
//# sourceMappingURL=Listener.js.map