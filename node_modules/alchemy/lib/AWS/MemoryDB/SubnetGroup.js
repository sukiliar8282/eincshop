import * as memorydb from "@distilled.cloud/aws/memorydb";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags } from "../../Tags.js";
import { readMemoryDbTags, sameStringSet } from "./internal.js";
/**
 * A MemoryDB subnet group — the set of VPC subnets a MemoryDB cluster's nodes
 * are placed into.
 *
 * Subnet groups are free and provision instantly. A cluster references one by
 * name via `subnetGroupName`.
 * ### Creating a Subnet Group
 * **Example:** Subnet Group Spanning Two Subnets
 * ```typescript
 * const subnetGroup = yield* SubnetGroup("CacheSubnets", {
 *   description: "MemoryDB cluster subnets",
 *   subnetIds: [subnetA.subnetId, subnetB.subnetId],
 * });
 * ```
 *
 * @resource
 */
export const SubnetGroup = Resource("AWS.MemoryDB.SubnetGroup");
export const SubnetGroupProvider = () => Provider.effect(SubnetGroup, Effect.gen(function* () {
    const toName = (id, props) => props.subnetGroupName
        ? Effect.succeed(props.subnetGroupName)
        : createPhysicalName({ id, maxLength: 40, lowercase: true });
    const readGroup = Effect.fn(function* (name) {
        const response = yield* memorydb
            .describeSubnetGroups({ SubnetGroupName: name })
            .pipe(Effect.catchTag("SubnetGroupNotFoundFault", () => Effect.succeed(undefined)));
        return response?.SubnetGroups?.[0];
    });
    const toAttrs = Effect.fn(function* (group) {
        if (!group.Name || !group.ARN) {
            return yield* Effect.fail(new Error(`Subnet group '${group.Name}' is missing its ARN`));
        }
        return {
            subnetGroupName: group.Name,
            subnetGroupArn: group.ARN,
            description: group.Description,
            vpcId: group.VpcId,
            subnetIds: (group.Subnets ?? [])
                .map((s) => s.Identifier)
                .filter((id) => id !== undefined),
            tags: yield* readMemoryDbTags(group.ARN),
        };
    });
    return {
        stables: ["subnetGroupName", "subnetGroupArn"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            if ((yield* toName(id, olds ?? { subnetIds: [] })) !==
                (yield* toName(id, news ?? { subnetIds: [] }))) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.subnetGroupName ??
                (yield* toName(id, olds ?? { subnetIds: [] }));
            const group = yield* readGroup(name);
            if (!group?.ARN)
                return undefined;
            const attrs = yield* toAttrs(group);
            return (yield* hasAlchemyTags(id, attrs.tags))
                ? attrs
                : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const props = news ?? { subnetIds: [] };
            const name = output?.subnetGroupName ?? (yield* toName(id, props));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...props.tags };
            // 1. Observe — cloud state is authoritative.
            let observed = yield* readGroup(name);
            // 2. Ensure — create if missing; tolerate AlreadyExists as a race.
            if (observed === undefined) {
                yield* memorydb
                    .createSubnetGroup({
                    SubnetGroupName: name,
                    Description: props.description,
                    SubnetIds: props.subnetIds,
                    Tags: Object.entries(desiredTags).map(([Key, Value]) => ({
                        Key,
                        Value,
                    })),
                })
                    .pipe(Effect.catchTag("SubnetGroupAlreadyExistsFault", () => Effect.void));
                observed = yield* readGroup(name);
            }
            if (observed === undefined) {
                return yield* Effect.fail(new Error(`Subnet group '${name}' not found after create`));
            }
            // 3. Sync — apply description / subnet delta from OBSERVED state.
            const update = {
                SubnetGroupName: name,
            };
            let mutated = false;
            if (props.description !== undefined &&
                props.description !== observed.Description) {
                update.Description = props.description;
                mutated = true;
            }
            const observedSubnets = (observed.Subnets ?? [])
                .map((s) => s.Identifier)
                .filter((s) => s !== undefined);
            if (!sameStringSet(props.subnetIds, observedSubnets)) {
                update.SubnetIds = props.subnetIds;
                mutated = true;
            }
            if (mutated) {
                const response = yield* memorydb.updateSubnetGroup(update);
                observed = response.SubnetGroup ?? observed;
            }
            // 3b. Sync tags — diff against OBSERVED cloud tags.
            const arn = observed.ARN;
            if (arn) {
                const observedTags = yield* readMemoryDbTags(arn);
                const { removed, upsert } = diffTags(observedTags, desiredTags);
                if (upsert.length > 0) {
                    yield* memorydb.tagResource({ ResourceArn: arn, Tags: upsert });
                }
                if (removed.length > 0) {
                    yield* memorydb.untagResource({
                        ResourceArn: arn,
                        TagKeys: removed,
                    });
                }
            }
            yield* session.note(name);
            return yield* toAttrs(observed);
        }),
        delete: Effect.fn(function* ({ output }) {
            // A subnet group still attached to a cluster rejects deletion with
            // SubnetGroupInUseFault — retry (bounded) while the cluster releases
            // it. NotFound is success (idempotent delete).
            yield* memorydb
                .deleteSubnetGroup({ SubnetGroupName: output.subnetGroupName })
                .pipe(Effect.catchTag("SubnetGroupNotFoundFault", () => Effect.void), Effect.retry({
                while: (e) => e._tag === "SubnetGroupInUseFault",
                schedule: Schedule.max([
                    Schedule.fixed("5 seconds"),
                    Schedule.recurs(12),
                ]),
            }));
        }),
        list: () => memorydb.describeSubnetGroups.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.SubnetGroups ?? []).filter((group) => group.Name !== undefined && group.ARN !== undefined))), Effect.flatMap(Effect.forEach((group) => toAttrs(group), { concurrency: 4 }))),
    };
}));
//# sourceMappingURL=SubnetGroup.js.map