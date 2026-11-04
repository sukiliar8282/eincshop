import * as cloudConnector from "@distilled.cloud/cloudflare/cloud-connector";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { listAllZones } from "../Zone/lookup.js";
const TypeId = "Cloudflare.CloudConnector.Rules";
/**
 * The ordered list of Cloud Connector rules for a Cloudflare zone.
 *
 * Cloud Connector routes matching traffic directly from Cloudflare's edge
 * to a cloud-provider object-storage bucket (Cloudflare R2, Amazon S3,
 * Google Cloud Storage, or Azure Blob Storage) without an origin server.
 * Each rule pairs a Rules-language expression with the target bucket host.
 *
 * The zone has exactly one rule list — the API only supports replacing the
 * whole list — so this resource owns it in its entirety (PUT-replace
 * semantics) and there should be at most one `Rules`
 * resource per zone. Destroying the resource clears the list.
 *
 * Safety: when there is no prior state and the zone already has a
 * non-empty rule list, `read` reports it as `Unowned` and the engine
 * refuses to take it over unless `--adopt` (or `adopt(true)`) is set.
 *
 * Note: Cloud Connector only takes effect on proxied (orange-cloud) DNS
 * records, and the number of rules per zone is plan-limited.
 * ### Routing to object storage
 * **Example:** Serve a path prefix from an S3 bucket
 * ```typescript
 * yield* Cloudflare.CloudConnector.Rules("Rules", {
 *   zoneId: zone.zoneId,
 *   rules: [
 *     {
 *       provider: "aws_s3",
 *       expression: 'http.request.uri.path wildcard "/images/*"',
 *       host: "mybucket.s3.amazonaws.com",
 *       description: "serve images from S3",
 *     },
 *   ],
 * });
 * ```
 *
 * **Example:** Serve static assets from an R2 bucket
 * ```typescript
 * const bucket = yield* Cloudflare.R2.Bucket("Assets", {});
 *
 * yield* Cloudflare.CloudConnector.Rules("Rules", {
 *   zoneId: zone.zoneId,
 *   rules: [
 *     {
 *       provider: "cloudflare_r2",
 *       expression: 'http.request.uri.path wildcard "/assets/*"',
 *       // public R2 bucket host (r2.dev or a custom domain)
 *       host: publicBucketHost,
 *       description: "static assets from R2",
 *     },
 *   ],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/rules/cloud-connector/
 *
 * @resource
 * @product Cloud Connector
 * @category Rules & Configuration
 */
export const Rules = Resource(TypeId);
/**
 * Returns true if the given value is a Rules resource.
 */
export const isRules = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const RulesProvider = () => Provider.succeed(Rules, {
    stables: ["zoneId"],
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // No account-wide API for Cloud Connector rules — the rule list is
        // a per-zone singleton, so enumerate every zone and read its list.
        const zones = yield* listAllZones(accountId);
        const rows = yield* Effect.forEach(zones, (zone) => listObservedRules(zone.id).pipe(Effect.map((rules) => 
        // A zone with no rules has nothing to manage — same as
        // `read` returning `undefined` for an empty list.
        rules.length === 0 ? undefined : { zoneId: zone.id, rules }), 
        // Plan-gated zones reject the route; skip them.
        Effect.catchTag("Forbidden", () => Effect.succeed(undefined))), { concurrency: 10 });
        return rows.filter((row) => row !== undefined);
    }),
    diff: Effect.fn(function* ({ olds, news, output }) {
        const o = olds;
        const n = news;
        // zoneId is the resource's identity; compare only once both sides
        // are concrete.
        const oldZoneId = output?.zoneId ?? (typeof o.zoneId === "string" ? o.zoneId : undefined);
        if (typeof n.zoneId === "string" &&
            oldZoneId !== undefined &&
            oldZoneId !== n.zoneId) {
            return { action: "replace" };
        }
    }),
    read: Effect.fn(function* ({ olds, output }) {
        const zoneId = output?.zoneId ?? olds?.zoneId;
        if (!zoneId)
            return undefined;
        const observed = yield* listObservedRules(zoneId);
        // An empty list means the resource doesn't exist — the API has no
        // separate "created but empty" state.
        if (observed.length === 0)
            return undefined;
        const attrs = { zoneId, rules: observed };
        // No prior state of our own but the zone already has rules — they
        // may be managed by hand or by another tool. Refuse to take over
        // unless adoption is explicitly allowed.
        if (output === undefined)
            return Unowned(attrs);
        return attrs;
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        // Inputs have been resolved to concrete values by Plan.
        const zoneId = (output?.zoneId ?? news.zoneId);
        const desired = news.rules.map((rule) => ({
            provider: rule.provider,
            expression: rule.expression,
            host: rule.host,
            enabled: rule.enabled ?? true,
            description: rule.description,
        }));
        // Observe the live rule list and skip the PUT when it already
        // matches the desired state (ignoring server-assigned rule ids).
        const observed = yield* listObservedRules(zoneId);
        if (!rulesEqual(desired, observed)) {
            yield* cloudConnector.putRule({
                zoneId,
                rules: desired.map((rule) => ({
                    provider: rule.provider,
                    expression: rule.expression,
                    parameters: { host: rule.host },
                    enabled: rule.enabled,
                    description: rule.description,
                })),
            });
        }
        // Re-read so attributes carry Cloudflare's canonical view,
        // including server-assigned rule ids.
        const synced = yield* listObservedRules(zoneId);
        return { zoneId, rules: synced };
    }),
    delete: Effect.fn(function* ({ output }) {
        // The API has no DELETE endpoint — clearing the list is a PUT with
        // an empty rule array, which is naturally idempotent. A zone deleted
        // out-of-band surfaces as InvalidRoute (Cloudflare code 7003) — the
        // rules are gone with it.
        yield* cloudConnector
            .putRule({ zoneId: output.zoneId, rules: [] })
            .pipe(Effect.catchTag("InvalidRoute", () => Effect.void));
    }),
});
const listObservedRules = (zoneId) => cloudConnector.listRules.items({ zoneId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((rule) => rule.expression == null ||
    rule.provider == null ||
    rule.parameters?.host == null
    ? []
    : [
        {
            id: rule.id ?? undefined,
            provider: rule.provider,
            expression: rule.expression,
            host: rule.parameters.host,
            enabled: rule.enabled ?? true,
            description: rule.description ?? undefined,
        },
    ])), 
// A zone that has never had Cloud Connector rules configured reports
// "could not find entrypoint ruleset" (code 10003) — that's just an
// empty list.
Effect.catchTag("CloudConnectorRulesNotFound", () => Effect.succeed([])));
const rulesEqual = (desired, observed) => desired.length === observed.length &&
    desired.every((d, i) => {
        const o = observed[i];
        return (d.provider === o.provider &&
            d.expression === o.expression &&
            d.host === o.host &&
            d.enabled === o.enabled &&
            (d.description ?? undefined) === o.description);
    });
//# sourceMappingURL=Rules.js.map