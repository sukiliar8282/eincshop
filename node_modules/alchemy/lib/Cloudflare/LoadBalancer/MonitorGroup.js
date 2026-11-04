import * as loadBalancers from "@distilled.cloud/cloudflare/load-balancers";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.LoadBalancer.MonitorGroup";
/**
 * A Cloudflare Load Balancing monitor group — aggregates several
 * {@link Monitor}s into one health signal that a
 * {@link Pool} can reference via `monitorGroup` (mutually
 * exclusive with `monitor`).
 *
 * Monitor groups are an Enterprise-only feature; on non-entitled accounts
 * creation fails with the typed `MonitorGroupsNotEnabled` error.
 * ### Creating a Monitor Group
 * **Example:** Group of two monitors
 * ```typescript
 * const group = yield* Cloudflare.LoadBalancer.MonitorGroup("ApiChecks", {
 *   members: [
 *     { monitorId: httpsMonitor.monitorId },
 *     { monitorId: tcpMonitor.monitorId, mustBeHealthy: false },
 *   ],
 * });
 * ```
 *
 * ### Using with a Pool
 * **Example:** Attach the group to a pool
 * ```typescript
 * yield* Cloudflare.LoadBalancer.Pool("ApiPool", {
 *   origins: [{ name: "origin-1", address: "203.0.113.10" }],
 *   monitorGroup: group.monitorGroupId,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/load-balancing/monitors/
 *
 * @resource
 * @product Load Balancers
 * @category Performance & Reliability
 */
export const MonitorGroup = Resource(TypeId);
/**
 * Returns true if the given value is a MonitorGroup resource.
 */
export const isMonitorGroup = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const MonitorGroupProvider = () => Provider.succeed(MonitorGroup, {
    stables: ["monitorGroupId", "accountId", "createdOn"],
    diff: Effect.fn(function* ({ output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        if ((output?.accountId ?? accountId) !== accountId) {
            return { action: "replace" };
        }
        return undefined;
    }),
    // Monitor groups are an account-scoped collection — paginate the
    // account-wide list and hydrate each into the exact `read` Attributes
    // shape (pattern (b) in processes/list-support.md).
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* loadBalancers.listMonitorGroups.pages({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((g) => toAttributes(g, accountId)))));
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        if (output?.monitorGroupId) {
            const observed = yield* getMonitorGroup(acct, output.monitorGroupId);
            return observed ? toAttributes(observed, acct) : undefined;
        }
        // Cold read — recover from lost state by matching the deterministic
        // description (our physical name). Monitor groups carry no ownership
        // marker, so report the match as Unowned.
        const description = yield* createDescription(id, olds?.description);
        const match = yield* findByDescription(acct, description);
        if (match)
            return Unowned(toAttributes(match, acct));
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const description = yield* createDescription(id, news.description);
        const members = buildMembers(news);
        // 1. Observe — output.monitorGroupId is a cache hint.
        const observed = output?.monitorGroupId
            ? yield* getMonitorGroup(output.accountId ?? accountId, output.monitorGroupId)
            : undefined;
        // 2. Ensure — missing: create with the full desired body.
        if (!observed) {
            const created = yield* loadBalancers.createMonitorGroup({
                accountId,
                description,
                members,
            });
            return toAttributes(created, accountId);
        }
        // 3. Sync — PUT the full desired body when anything drifts; skip
        //    the call on a no-op.
        const dirty = observed.description !== description ||
            JSON.stringify(observed.members.map((m) => ({
                monitorId: m.monitorId,
                enabled: m.enabled,
                monitoringOnly: m.monitoringOnly,
                mustBeHealthy: m.mustBeHealthy,
            }))) !== JSON.stringify(members);
        if (!dirty) {
            return toAttributes(observed, accountId);
        }
        const updated = yield* loadBalancers.updateMonitorGroup({
            accountId,
            monitorGroupId: observed.id,
            description,
            members,
        });
        return toAttributes(updated, accountId);
    }),
    delete: Effect.fn(function* ({ output }) {
        // A group still referenced by a pool cannot be deleted — retry the
        // typed MonitorGroupInUse tag with bounded backoff while the engine
        // tears down dependents.
        yield* loadBalancers
            .deleteMonitorGroup({
            accountId: output.accountId,
            monitorGroupId: output.monitorGroupId,
        })
            .pipe(Effect.retry({
            while: (e) => e._tag === "MonitorGroupInUse",
            schedule: Schedule.max([
                Schedule.exponential("1 second"),
                Schedule.recurs(6),
            ]),
        }), Effect.catchTag("MonitorGroupNotFound", () => Effect.void));
    }),
});
/**
 * Read a monitor group by id, mapping "gone" (`MonitorGroupNotFound`,
 * HTTP 404 code 1001) to `undefined`.
 */
const getMonitorGroup = (accountId, monitorGroupId) => loadBalancers
    .getMonitorGroup({ accountId, monitorGroupId })
    .pipe(Effect.catchTag("MonitorGroupNotFound", () => Effect.succeed(undefined)));
/**
 * Find a monitor group by exact description. If several carry the same
 * description, pick the oldest for determinism.
 */
const findByDescription = (accountId, description) => loadBalancers.listMonitorGroups.items({ accountId }).pipe(Stream.filter((g) => g.description === description), Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
    .sort((a, b) => (a.createdOn ?? "").localeCompare(b.createdOn ?? ""))
    .at(0)));
const createDescription = (id, description) => Effect.gen(function* () {
    return description ?? (yield* createPhysicalName({ id, lowercase: true }));
});
const buildMembers = (news) => news.members.map((m) => ({
    // Inputs are resolved to concrete strings by Plan.
    monitorId: m.monitorId,
    enabled: m.enabled ?? true,
    monitoringOnly: m.monitoringOnly ?? false,
    mustBeHealthy: m.mustBeHealthy ?? true,
}));
const toAttributes = (group, accountId) => ({
    monitorGroupId: group.id,
    accountId,
    description: group.description,
    createdOn: group.createdOn ?? undefined,
    modifiedOn: group.modifiedOn ?? undefined,
});
//# sourceMappingURL=MonitorGroup.js.map