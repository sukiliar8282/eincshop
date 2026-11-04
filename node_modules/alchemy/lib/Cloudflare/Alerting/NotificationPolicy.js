import * as alerting from "@distilled.cloud/cloudflare/alerting";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.Alerting.NotificationPolicy";
/**
 * A Cloudflare Notifications policy.
 *
 * A notification policy connects an alert type (the event Cloudflare
 * watches for) to one or more destinations — email addresses, webhook
 * destinations, or PagerDuty services — optionally narrowed by filters.
 * ### Creating a policy
 * **Example:** Email notifications for Universal SSL events
 * ```typescript
 * yield* Cloudflare.Alerting.NotificationPolicy("SslAlerts", {
 *   alertType: "universal_ssl_event_type",
 *   mechanisms: { email: [{ id: "ops@example.com" }] },
 * });
 * ```
 *
 * **Example:** Disabled policy with a description
 * ```typescript
 * yield* Cloudflare.Alerting.NotificationPolicy("SslAlerts", {
 *   alertType: "universal_ssl_event_type",
 *   enabled: false,
 *   description: "Paused during migration",
 *   mechanisms: { email: [{ id: "ops@example.com" }] },
 * });
 * ```
 *
 * ### Webhook destinations
 * **Example:** Dispatch to a webhook destination
 * ```typescript
 * const webhook = yield* Cloudflare.Alerting.NotificationWebhook("AlertsHook", {
 *   url: "https://alerts.example.com/cf",
 * });
 *
 * yield* Cloudflare.Alerting.NotificationPolicy("SslAlerts", {
 *   alertType: "universal_ssl_event_type",
 *   mechanisms: { webhooks: [{ id: webhook.webhookId }] },
 * });
 * ```
 *
 * ### Filters
 * **Example:** Health check alerts for specific zones
 * ```typescript
 * yield* Cloudflare.Alerting.NotificationPolicy("HealthAlerts", {
 *   alertType: "health_check_status_notification",
 *   mechanisms: { email: [{ id: "ops@example.com" }] },
 *   filters: {
 *     healthCheckId: [healthCheckId],
 *     newHealth: ["Unhealthy"],
 *   },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/notifications/
 *
 * @resource
 * @product Alerting
 * @category Observability & Analytics
 */
export const NotificationPolicy = Resource(TypeId);
/**
 * Returns true if the given value is a NotificationPolicy resource.
 */
export const isNotificationPolicy = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const NotificationPolicyProvider = () => Provider.succeed(NotificationPolicy, {
    stables: ["policyId", "accountId", "alertType"],
    // Account-scoped collection: exhaustively paginate the account's
    // notification policies and hydrate each into the `read` attribute shape.
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* alerting.listPolicies.pages({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? [])
            .map(narrowPolicy)
            .filter((p) => p !== undefined)
            .map((p) => toPolicyAttributes(p, accountId)))));
    }),
    diff: Effect.fn(function* ({ olds = {}, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        if ((output?.accountId ?? accountId) !== accountId) {
            return { action: "replace" };
        }
        // The valid filter/mechanism shape depends on the alert type — a
        // policy alerting on a different event is a different policy.
        // `alertType` is a plain string prop, statically knowable here.
        const o = olds;
        const n = news;
        const oldAlertType = output?.alertType ?? o.alertType;
        if (oldAlertType !== undefined && oldAlertType !== n.alertType) {
            return { action: "replace" };
        }
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        // Owned path: refresh by the persisted policy id.
        if (output?.policyId) {
            const observed = yield* observePolicy(acct, output.policyId);
            if (observed)
                return toPolicyAttributes(observed, acct);
            return undefined;
        }
        // Cold read: no persisted id (state-persistence failure) — find the
        // deterministic physical name in the account's policy list.
        const name = yield* createPolicyName(id, olds?.name);
        const match = yield* findPolicyByName(acct, name);
        if (match)
            return toPolicyAttributes(match, acct);
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const name = yield* createPolicyName(id, news.name);
        const desired = buildPolicyBody(name, news);
        // 1. Observe — by cached id first, then by deterministic name.
        let observed;
        if (output?.policyId) {
            observed = yield* observePolicy(accountId, output.policyId);
        }
        if (!observed) {
            observed = yield* findPolicyByName(accountId, name);
        }
        // 2. Ensure — create when missing. `createPolicy` only returns the
        //    new id; re-read for the full attribute set.
        if (!observed) {
            const created = yield* alerting.createPolicy({
                accountId,
                ...desired,
            });
            if (!created.id) {
                return yield* Effect.fail(new Error("Cloudflare did not return an id for the created notification policy"));
            }
            const fresh = yield* observePolicy(accountId, created.id);
            return toPolicyAttributes(fresh ?? { id: created.id }, accountId);
        }
        // 3. Sync — PUT the full desired body when any mutable aspect
        //    drifts from the observed cloud state.
        if (!policyEqualsObserved(desired, observed)) {
            yield* alerting.updatePolicy({
                accountId,
                policyId: observed.id,
                ...desired,
            });
            const fresh = yield* observePolicy(accountId, observed.id);
            return toPolicyAttributes(fresh ?? observed, accountId);
        }
        // 4. Return.
        return toPolicyAttributes(observed, accountId);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* alerting
            .deletePolicy({
            accountId: output.accountId,
            policyId: output.policyId,
        })
            .pipe(Effect.catchTag("PolicyNotFound", () => Effect.void));
    }),
});
const undef = (v) => v == null ? undefined : v;
const narrowPolicy = (raw) => raw.id == null
    ? undefined
    : {
        id: raw.id,
        name: undef(raw.name),
        alertType: undef(raw.alertType),
        enabled: undef(raw.enabled),
        description: undef(raw.description),
        alertInterval: undef(raw.alertInterval),
        mechanisms: raw.mechanisms ?? undefined,
        filters: raw.filters ?? undefined,
        created: undef(raw.created),
        modified: undef(raw.modified),
    };
const observePolicy = (accountId, policyId) => alerting.getPolicy({ accountId, policyId }).pipe(Effect.map((p) => narrowPolicy({ ...p, id: p.id ?? policyId })), Effect.catchTag("PolicyNotFound", () => Effect.succeed(undefined)));
const findPolicyByName = (accountId, name) => alerting.listPolicies.items({ accountId }).pipe(Stream.filter((p) => p.name === name && p.id != null), Stream.runHead, Effect.map(Option.getOrUndefined), Effect.map((p) => (p === undefined ? undefined : narrowPolicy(p))));
const toPolicyAttributes = (observed, accountId) => ({
    policyId: observed.id,
    accountId,
    name: observed.name ?? "",
    alertType: (observed.alertType ?? "universal_ssl_event_type"),
    enabled: observed.enabled ?? true,
    created: observed.created,
    modified: observed.modified,
});
const createPolicyName = (id, name) => Effect.gen(function* () {
    return name ?? (yield* createPhysicalName({ id, lowercase: true }));
});
const buildPolicyBody = (name, news) => ({
    name,
    alertType: news.alertType,
    enabled: news.enabled ?? true,
    description: news.description,
    alertInterval: news.alertInterval,
    // `Input<string>` ids are resolved to concrete strings by the engine
    // before reconcile runs.
    mechanisms: news.mechanisms,
    filters: news.filters,
});
/**
 * Compare the desired policy body against observed cloud state.
 * `mechanisms`/`filters` are compared structurally with `null`/`undefined`
 * dropped and object keys sorted, since Cloudflare echoes optional fields
 * as `null`.
 */
const policyEqualsObserved = (desired, observed) => desired.name === (observed.name ?? "") &&
    desired.enabled === (observed.enabled ?? true) &&
    (desired.description ?? "") === (observed.description ?? "") &&
    (desired.alertInterval ?? undefined) === observed.alertInterval &&
    normalizedEquals(desired.mechanisms, observed.mechanisms) &&
    normalizedEquals(desired.filters, observed.filters);
const normalizedEquals = (a, b) => JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));
/** Drop null/undefined members and sort object keys for stable comparison. */
const normalize = (value) => {
    if (value === null || value === undefined)
        return undefined;
    if (Array.isArray(value))
        return value.map(normalize);
    if (typeof value === "object") {
        const out = {};
        for (const key of Object.keys(value).sort()) {
            const v = normalize(value[key]);
            if (v !== undefined)
                out[key] = v;
        }
        return Object.keys(out).length === 0 ? undefined : out;
    }
    return value;
};
//# sourceMappingURL=NotificationPolicy.js.map