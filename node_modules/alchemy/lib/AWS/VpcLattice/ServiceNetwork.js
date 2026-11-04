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
 * An Amazon VPC Lattice service network — the logical boundary that connects
 * services and VPCs into one application network. Cheap control-plane resource
 * with no per-hour charge until VPCs or services are associated.
 *
 * ### Creating Service Networks
 * **Example:** Basic Service Network
 * ```typescript
 * const network = yield* ServiceNetwork("AppNetwork", {});
 * ```
 *
 * **Example:** IAM-Authorized Network
 * ```typescript
 * const network = yield* ServiceNetwork("SecureNetwork", {
 *   authType: "AWS_IAM",
 *   tags: { Environment: "prod" },
 * });
 * ```
 *
 * @resource
 */
export const ServiceNetwork = Resource("AWS.VpcLattice.ServiceNetwork");
export const ServiceNetworkProvider = () => Provider.effect(ServiceNetwork, Effect.gen(function* () {
    const toName = (id, props = {}) => props.name
        ? Effect.succeed(props.name)
        : createPhysicalName({ id, maxLength: 63, lowercase: true });
    // getServiceNetwork only accepts an id or ARN — never a name. Look up by
    // id when we have one, and fall back to enumerating for name-based
    // discovery (adoption / lost-state recovery / create-conflict recovery).
    const observe = (serviceNetworkIdentifier) => vpclattice
        .getServiceNetwork({ serviceNetworkIdentifier })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    const findByName = (name) => vpclattice.listServiceNetworks.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
        .flatMap((page) => page.items ?? [])
        .find((s) => s.name === name)), Effect.flatMap((summary) => summary?.id ? observe(summary.id) : Effect.succeed(undefined)));
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
    const isOwnedAssociation = Effect.fn(function* (arn, ownerTags) {
        const listed = yield* vpclattice
            .listTagsForResource({ resourceArn: arn })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        if (!listed)
            return false;
        const tags = tagRecord(listed.tags);
        return (tags["alchemy::id"] !== undefined &&
            tags["alchemy::stack"] === ownerTags["alchemy::stack"] &&
            tags["alchemy::stage"] === ownerTags["alchemy::stage"]);
    });
    const deleteVpcAssociations = Effect.fn(function* (serviceNetworkId, ownerTags, force) {
        const pages = yield* vpclattice.listServiceNetworkVpcAssociations
            .pages({ serviceNetworkIdentifier: serviceNetworkId })
            .pipe(Stream.runCollect);
        const associations = Array.from(pages).flatMap((page) => page.items ?? []);
        yield* Effect.forEach(associations, (association) => Effect.gen(function* () {
            if (!association.id ||
                !association.arn ||
                (!force &&
                    !(yield* isOwnedAssociation(association.arn, ownerTags)))) {
                return;
            }
            yield* retryOnConflict(vpclattice.deleteServiceNetworkVpcAssociation({
                serviceNetworkVpcAssociationIdentifier: association.id,
            })).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            yield* waitUntilAbsent(vpclattice
                .getServiceNetworkVpcAssociation({
                serviceNetworkVpcAssociationIdentifier: association.id,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined))));
        }), { concurrency: 10 });
    });
    const deleteServiceAssociations = Effect.fn(function* (serviceNetworkId, ownerTags, force) {
        const pages = yield* vpclattice.listServiceNetworkServiceAssociations
            .pages({ serviceNetworkIdentifier: serviceNetworkId })
            .pipe(Stream.runCollect);
        const associations = Array.from(pages).flatMap((page) => page.items ?? []);
        yield* Effect.forEach(associations, (association) => Effect.gen(function* () {
            if (!association.id ||
                !association.arn ||
                (!force &&
                    !(yield* isOwnedAssociation(association.arn, ownerTags)))) {
                return;
            }
            yield* retryOnConflict(vpclattice.deleteServiceNetworkServiceAssociation({
                serviceNetworkServiceAssociationIdentifier: association.id,
            })).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            yield* waitUntilAbsent(vpclattice
                .getServiceNetworkServiceAssociation({
                serviceNetworkServiceAssociationIdentifier: association.id,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined))));
        }), { concurrency: 10 });
    });
    const deleteResourceAssociations = Effect.fn(function* (serviceNetworkId, ownerTags, force) {
        const pages = yield* vpclattice.listServiceNetworkResourceAssociations
            .pages({ serviceNetworkIdentifier: serviceNetworkId })
            .pipe(Stream.runCollect);
        const associations = Array.from(pages).flatMap((page) => page.items ?? []);
        yield* Effect.forEach(associations, (association) => Effect.gen(function* () {
            if (!association.id ||
                !association.arn ||
                (!force &&
                    !(yield* isOwnedAssociation(association.arn, ownerTags)))) {
                return;
            }
            yield* retryOnConflict(vpclattice.deleteServiceNetworkResourceAssociation({
                serviceNetworkResourceAssociationIdentifier: association.id,
            })).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            yield* waitUntilAbsent(vpclattice
                .getServiceNetworkResourceAssociation({
                serviceNetworkResourceAssociationIdentifier: association.id,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined))));
        }), { concurrency: 10 });
    });
    return {
        stables: ["serviceNetworkId", "serviceNetworkArn", "name"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return;
            if ((yield* toName(id, olds ?? {})) !== (yield* toName(id, news ?? {}))) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const network = output?.serviceNetworkId
                ? yield* observe(output.serviceNetworkId)
                : yield* findByName(yield* toName(id, olds ?? {}));
            if (!network?.arn || !network.id)
                return undefined;
            const listed = yield* vpclattice.listTagsForResource({
                resourceArn: network.arn,
            });
            const attrs = {
                serviceNetworkId: network.id,
                serviceNetworkArn: network.arn,
                name: network.name,
                authType: network.authType ?? "NONE",
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
            const desiredAuthType = news.authType ?? "NONE";
            // Observe — prefer the stable id cache, fall back to name lookup.
            let network = output?.serviceNetworkId
                ? yield* observe(output.serviceNetworkId)
                : yield* findByName(name);
            // Ensure — create if missing.
            if (!network?.arn || !network.id) {
                network = yield* vpclattice
                    .createServiceNetwork({ name, authType: desiredAuthType })
                    .pipe(Effect.catchTag("ConflictException", () => findByName(name)));
                if (!network?.arn || !network.id) {
                    return yield* Effect.fail(new Error(`Failed to create service network ${name}`));
                }
            }
            else if ((network.authType ?? "NONE") !== desiredAuthType) {
                // Sync auth type — the only mutable setting.
                yield* vpclattice.updateServiceNetwork({
                    serviceNetworkIdentifier: network.id,
                    authType: desiredAuthType,
                });
            }
            yield* syncTags(network.arn, desiredTags);
            yield* session.note(network.arn);
            return {
                serviceNetworkId: network.id,
                serviceNetworkArn: network.arn,
                name,
                authType: desiredAuthType,
                tags: desiredTags,
            };
        }),
        list: () => Effect.gen(function* () {
            const summaries = yield* vpclattice.listServiceNetworks
                .pages({})
                .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.items ?? [])));
            return yield* Effect.forEach(summaries.filter((s) => s.id != null && s.arn != null), (summary) => Effect.gen(function* () {
                const network = yield* observe(summary.id);
                const listed = yield* vpclattice.listTagsForResource({
                    resourceArn: summary.arn,
                });
                return {
                    serviceNetworkId: summary.id,
                    serviceNetworkArn: summary.arn,
                    name: summary.name,
                    authType: network?.authType ?? "NONE",
                    tags: tagRecord(listed.tags),
                };
            }), { concurrency: 10 });
        }),
        delete: Effect.fn(function* ({ output, force }) {
            if (!(yield* observe(output.serviceNetworkId))) {
                return;
            }
            // Nuke discovers resources independently and therefore cannot rely on
            // the stack dependency graph to order association deletion before the
            // service network. An operator-confirmed nuke may remove every
            // attached association blocking deletion. Ordinary stack deletion is
            // deliberately conservative and removes only associations owned by
            // the same Alchemy stack/stage.
            yield* Effect.all([
                deleteVpcAssociations(output.serviceNetworkId, output.tags, force === true),
                deleteServiceAssociations(output.serviceNetworkId, output.tags, force === true),
                deleteResourceAssociations(output.serviceNetworkId, output.tags, force === true),
            ], { concurrency: 3 });
            yield* retryOnConflict(vpclattice.deleteServiceNetwork({
                serviceNetworkIdentifier: output.serviceNetworkId,
            })).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            yield* waitUntilAbsent(observe(output.serviceNetworkId));
        }),
    };
}));
//# sourceMappingURL=ServiceNetwork.js.map