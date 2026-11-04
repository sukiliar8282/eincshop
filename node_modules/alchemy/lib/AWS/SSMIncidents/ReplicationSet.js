import * as incidents from "@distilled.cloud/aws/ssm-incidents";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { Unowned } from "../../AdoptPolicy.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
/**
 * Raised when the replication set enters a terminal `FAILED` state (or does
 * not become `ACTIVE` within the bounded wait window) while reconciling.
 */
export class ReplicationSetNotActive extends Data.TaggedError("ReplicationSetNotActive") {
}
/**
 * The Incident Manager replication set — the account/region singleton that
 * onboards AWS Systems Manager Incident Manager. Creating it replicates and
 * encrypts Incident Manager data (response plans, incidents, contacts) to the
 * configured Regions; deleting it offboards Incident Manager and removes all
 * Incident Manager data account-wide.
 *
 * Only one replication set can exist per account, so this is a
 * capture-and-restore singleton: adopting a pre-existing replication set that
 * Alchemy did not create requires `--adopt`.
 *
 * ### Onboarding Incident Manager
 * **Example:** Replication set in the current Region
 * ```typescript
 * const replicationSet = yield* SSMIncidents.ReplicationSet("Incidents", {});
 * ```
 *
 * **Example:** Multi-Region replication with a KMS key
 * ```typescript
 * const replicationSet = yield* SSMIncidents.ReplicationSet("Incidents", {
 *   regions: {
 *     "us-east-1": {},
 *     "us-west-2": { sseKmsKeyId: key.keyArn },
 *   },
 *   deletionProtected: true,
 * });
 * ```
 */
const ReplicationSetResource = Resource("AWS.SSMIncidents.ReplicationSet");
export { ReplicationSetResource as ReplicationSet };
// Explicitly-typed pipeable helpers. Inlining `Effect.retry`/`Effect.repeat`
// in a provider lifecycle op leaks `Retry.Return`'s conditional into
// declaration emit and widens the provider layer to `unknown` R for every
// consumer of `AWS.providers()`.
/**
 * Polls the replication set until it leaves its transitional state
 * (`CREATING`/`UPDATING`), then fails with a typed error unless it landed on
 * `ACTIVE`. Bounded: ~5s x 60 = 5 minutes (onboarding takes ~1-2 minutes).
 */
const waitForReplicationSetActive = (arn) => incidents.getReplicationSet({ arn }).pipe(Effect.map((r) => r.replicationSet), Effect.repeat({
    schedule: Schedule.max([Schedule.fixed(5000), Schedule.recurs(60)]),
    until: (rs) => rs.status !== "CREATING" && rs.status !== "UPDATING",
}), Effect.flatMap((rs) => rs.status === "ACTIVE"
    ? Effect.succeed(rs)
    : Effect.fail(new ReplicationSetNotActive({
        message: `replication set ${arn} did not become ACTIVE`,
        status: rs.status,
    }))));
/**
 * Polls until the replication set is fully gone (offboarding takes ~1-2
 * minutes and a subsequent create conflicts until it completes). Bounded:
 * ~5s x 60 = 5 minutes.
 */
const waitForReplicationSetGone = (arn) => incidents.getReplicationSet({ arn }).pipe(Effect.map((r) => r.replicationSet.status), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed("GONE")), Effect.repeat({
    schedule: Schedule.max([Schedule.fixed(5000), Schedule.recurs(60)]),
    until: (status) => status === "GONE",
}), Effect.asVoid);
export const ReplicationSetProvider = () => Provider.effect(ReplicationSetResource, Effect.gen(function* () {
    // The replication set is the account singleton — its ARN is not
    // derivable, so observation always starts from the list.
    const observe = Effect.gen(function* () {
        const listed = yield* incidents.listReplicationSets({});
        const arn = listed.replicationSetArns[0];
        if (arn === undefined)
            return undefined;
        return yield* incidents.getReplicationSet({ arn }).pipe(Effect.map((r) => ({ ...r.replicationSet, arn })), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    const readTags = (arn) => incidents.listTagsForResource({ resourceArn: arn }).pipe(Effect.map((r) => Object.fromEntries(Object.entries(r.tags).filter((e) => e[1] !== undefined))), Effect.catch(() => Effect.succeed({})));
    const buildAttrs = (rs) => ({
        arn: rs.arn,
        status: rs.status,
        regionNames: Object.keys(rs.regionMap).sort(),
        deletionProtected: rs.deletionProtected,
    });
    const desiredRegions = Effect.fn(function* (props) {
        if (props.regions && Object.keys(props.regions).length > 0) {
            return props.regions;
        }
        const { region } = yield* AWSEnvironment.current;
        return { [region]: {} };
    });
    return ReplicationSetResource.Provider.of({
        stables: ["arn"],
        read: Effect.fn(function* ({ id, output }) {
            const live = yield* observe;
            if (live === undefined)
                return undefined;
            const attrs = buildAttrs(live);
            const tags = yield* readTags(live.arn);
            if (yield* hasAlchemyTags(id, tags))
                return attrs;
            // Tag-based ownership is best-effort — if we have prior state for
            // this exact singleton, it is ours; otherwise gate adoption.
            return output !== undefined ? attrs : Unowned(attrs);
        }),
        // Account/region singleton — report the single replication set, if any.
        list: () => observe.pipe(Effect.map((rs) => (rs ? [buildAttrs(rs)] : []))),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            const regions = yield* desiredRegions(news);
            // 1. OBSERVE — cloud state is authoritative; `output` is only an
            //    identifier cache.
            let live = yield* observe;
            // 2. ENSURE — onboard Incident Manager if there is no replication
            //    set. Tolerate the singleton-create race (ConflictException)
            //    by falling through to observation.
            if (live === undefined) {
                yield* session.note("creating Incident Manager replication set");
                const created = yield* incidents
                    .createReplicationSet({
                    regions: Object.fromEntries(Object.entries(regions).map(([name, cfg]) => [
                        name,
                        { sseKmsKeyId: cfg.sseKmsKeyId },
                    ])),
                    tags: desiredTags,
                })
                    .pipe(Effect.map((r) => r.arn), Effect.catchTag("ConflictException", () => incidents
                    .listReplicationSets({})
                    .pipe(Effect.map((r) => r.replicationSetArns[0]))));
                yield* waitForReplicationSetActive(created);
                live = (yield* observe);
            }
            else if (live.status === "CREATING" || live.status === "UPDATING") {
                // A prior reconcile may have been interrupted mid-transition.
                yield* waitForReplicationSetActive(live.arn);
                live = (yield* observe);
            }
            const arn = output?.arn ?? live.arn;
            // 3. SYNC regions — diff observed Region map against desired and
            //    apply one add/delete action at a time (the API allows a single
            //    Region change per update). Add first so the set never shrinks
            //    to zero.
            const observedRegions = Object.keys(live.regionMap);
            const toAdd = Object.keys(regions).filter((r) => !observedRegions.includes(r));
            const toRemove = observedRegions.filter((r) => !(r in regions));
            for (const regionName of toAdd) {
                yield* session.note(`adding region ${regionName}`);
                yield* incidents.updateReplicationSet({
                    arn,
                    actions: [
                        {
                            addRegionAction: {
                                regionName,
                                sseKmsKeyId: regions[regionName]?.sseKmsKeyId,
                            },
                        },
                    ],
                });
                yield* waitForReplicationSetActive(arn);
            }
            for (const regionName of toRemove) {
                yield* session.note(`removing region ${regionName}`);
                yield* incidents.updateReplicationSet({
                    arn,
                    actions: [{ deleteRegionAction: { regionName } }],
                });
                yield* waitForReplicationSetActive(arn);
            }
            // 3b. SYNC deletion protection — observed vs desired.
            const desiredProtection = news.deletionProtected ?? false;
            if (live.deletionProtected !== desiredProtection) {
                yield* incidents.updateDeletionProtection({
                    arn,
                    deletionProtected: desiredProtection,
                });
            }
            // 3c. SYNC tags — diff against OBSERVED cloud tags.
            const currentTags = yield* readTags(arn);
            const { upsert, removed } = diffTags(currentTags, desiredTags);
            if (upsert.length > 0) {
                yield* incidents.tagResource({
                    resourceArn: arn,
                    tags: Object.fromEntries(upsert.map((t) => [t.Key, t.Value])),
                });
            }
            if (removed.length > 0) {
                yield* incidents.untagResource({
                    resourceArn: arn,
                    tagKeys: removed,
                });
            }
            // 4. RETURN fresh attributes.
            const final = (yield* observe);
            yield* session.note(arn);
            return buildAttrs(final);
        }),
        delete: Effect.fn(function* ({ output }) {
            // Deleting the replication set offboards Incident Manager. Deletion
            // protection must be lifted first; both calls are idempotent.
            yield* incidents
                .updateDeletionProtection({
                arn: output.arn,
                deletionProtected: false,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            yield* incidents.deleteReplicationSet({ arn: output.arn }).pipe(Effect.asVoid, Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            // Offboarding is asynchronous (~1-2 minutes); wait until fully gone
            // so an immediate re-create does not conflict.
            yield* waitForReplicationSetGone(output.arn);
        }),
    });
}));
//# sourceMappingURL=ReplicationSet.js.map