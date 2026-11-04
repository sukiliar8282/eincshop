import * as vpclattice from "@distilled.cloud/aws/vpc-lattice";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags, tagRecord, } from "../../Tags.js";
import { retryOnConflict, waitUntilAbsent, waitUntilStable, } from "./internal.js";
/**
 * Associates a VPC Lattice service with a service network, making the
 * service reachable from every VPC associated with that network.
 *
 * ### Associating a Service
 * **Example:** Basic Association
 * ```typescript
 * const assoc = yield* ServiceNetworkServiceAssociation("PaymentsLink", {
 *   serviceNetworkIdentifier: network.serviceNetworkId,
 *   serviceIdentifier: service.serviceId,
 * });
 * ```
 *
 * @resource
 */
export const ServiceNetworkServiceAssociation = Resource("AWS.VpcLattice.ServiceNetworkServiceAssociation");
export const ServiceNetworkServiceAssociationProvider = () => Provider.effect(ServiceNetworkServiceAssociation, Effect.gen(function* () {
    const observe = (id) => vpclattice
        .getServiceNetworkServiceAssociation({
        serviceNetworkServiceAssociationIdentifier: id,
    })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    // Discover an existing association between the pair (create-conflict
    // recovery / lost-state recovery).
    const findByPair = (serviceNetworkIdentifier, serviceIdentifier) => vpclattice.listServiceNetworkServiceAssociations
        .pages({ serviceNetworkIdentifier, serviceIdentifier })
        .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.items ?? [])), Effect.flatMap((items) => items[0]?.id ? observe(items[0].id) : Effect.succeed(undefined)));
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
        stables: ["associationId", "associationArn"],
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return;
            if (olds?.serviceNetworkIdentifier !== news.serviceNetworkIdentifier ||
                olds?.serviceIdentifier !== news.serviceIdentifier) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const assoc = output?.associationId
                ? yield* observe(output.associationId)
                : olds
                    ? yield* findByPair(olds.serviceNetworkIdentifier, olds.serviceIdentifier)
                    : undefined;
            if (!assoc?.arn || !assoc.id)
                return undefined;
            const listed = yield* vpclattice.listTagsForResource({
                resourceArn: assoc.arn,
            });
            const attrs = {
                associationId: assoc.id,
                associationArn: assoc.arn,
                status: assoc.status ?? "UNKNOWN",
                serviceId: assoc.serviceId,
                serviceNetworkId: assoc.serviceNetworkId,
                dnsName: assoc.dnsEntry?.domainName,
                tags: tagRecord(listed.tags),
            };
            return (yield* hasAlchemyTags(id, listed.tags))
                ? attrs
                : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // Observe — prefer the stable id cache, fall back to pair lookup.
            let assoc = output?.associationId
                ? yield* observe(output.associationId)
                : yield* findByPair(news.serviceNetworkIdentifier, news.serviceIdentifier);
            // Ensure — create if missing. A ConflictException means the pair
            // is already associated (a race); recover the existing association.
            if (!assoc?.arn || !assoc.id) {
                const created = yield* retryOnConflict(vpclattice.createServiceNetworkServiceAssociation({
                    serviceNetworkIdentifier: news.serviceNetworkIdentifier,
                    serviceIdentifier: news.serviceIdentifier,
                    tags: desiredTags,
                })).pipe(Effect.catchTag("ConflictException", () => findByPair(news.serviceNetworkIdentifier, news.serviceIdentifier)));
                if (!created?.arn || !created.id) {
                    return yield* Effect.fail(new Error("Failed to create service network service association"));
                }
                assoc = yield* observe(created.id);
                if (!assoc?.arn || !assoc.id) {
                    assoc = {
                        id: created.id,
                        arn: created.arn,
                        status: created.status,
                    };
                }
            }
            const associationId = assoc.id;
            const associationArn = assoc.arn;
            if (!associationId || !associationArn) {
                return yield* Effect.fail(new Error("Service network service association is missing its id/arn"));
            }
            // Wait for the association to leave CREATE_IN_PROGRESS so
            // dependents observe a routable service.
            const stable = yield* waitUntilStable(observe(associationId));
            yield* syncTags(associationArn, desiredTags);
            yield* session.note(associationArn);
            return {
                associationId,
                associationArn,
                status: stable?.status ?? assoc.status ?? "ACTIVE",
                serviceId: stable?.serviceId,
                serviceNetworkId: stable?.serviceNetworkId,
                dnsName: stable?.dnsEntry?.domainName,
                tags: desiredTags,
            };
        }),
        list: () => Effect.gen(function* () {
            // ListServiceNetworkServiceAssociations requires a service
            // network or service filter, so enumerate networks first.
            const networks = yield* vpclattice.listServiceNetworks
                .pages({})
                .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.items ?? [])));
            const summaries = (yield* Effect.forEach(networks.filter((n) => n.id != null), (network) => vpclattice.listServiceNetworkServiceAssociations
                .pages({ serviceNetworkIdentifier: network.id })
                .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.items ?? []))), { concurrency: 5 })).flat();
            return yield* Effect.forEach(summaries.filter((s) => s.id != null && s.arn != null), (summary) => Effect.gen(function* () {
                const listed = yield* vpclattice.listTagsForResource({
                    resourceArn: summary.arn,
                });
                return {
                    associationId: summary.id,
                    associationArn: summary.arn,
                    status: summary.status ?? "UNKNOWN",
                    serviceId: summary.serviceId,
                    serviceNetworkId: summary.serviceNetworkId,
                    dnsName: summary.dnsEntry?.domainName,
                    tags: tagRecord(listed.tags),
                };
            }), { concurrency: 10 });
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* retryOnConflict(vpclattice.deleteServiceNetworkServiceAssociation({
                serviceNetworkServiceAssociationIdentifier: output.associationId,
            })).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            // Deletion is asynchronous; wait until the association is actually
            // gone so dependent service/network deletes don't conflict.
            yield* waitUntilAbsent(observe(output.associationId));
        }),
    };
}));
//# sourceMappingURL=ServiceNetworkServiceAssociation.js.map