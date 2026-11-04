import * as rum from "@distilled.cloud/aws/rum";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * The resource-based policy of a CloudWatch RUM app monitor — controls which
 * principals may send events to (`rum:PutRumEvents`) or read data from the
 * app monitor. An app monitor has at most one.
 *
 * ### Creating a Resource Policy
 * **Example:** Allow the Account to Send RUM Events
 * ```typescript
 * const monitor = yield* RUM.AppMonitor("SiteMonitor", {
 *   domain: "example.com",
 * });
 * const policy = yield* RUM.ResourcePolicy("SitePolicy", {
 *   appMonitorName: monitor.appMonitorName,
 *   policyDocument: monitor.appMonitorArn.map((arn) =>
 *     JSON.stringify({
 *       Version: "2012-10-17",
 *       Statement: [
 *         {
 *           Effect: "Allow",
 *           Principal: { AWS: "arn:aws:iam::123456789012:root" },
 *           Action: ["rum:PutRumEvents"],
 *           Resource: arn,
 *         },
 *       ],
 *     }),
 *   ),
 * });
 * ```
 *
 * @resource
 */
export const ResourcePolicy = Resource("AWS.RUM.ResourcePolicy");
/** Order-insensitive canonical form of a JSON policy document. */
const canonicalJson = (document) => {
    const sort = (value) => Array.isArray(value)
        ? value.map(sort)
        : value !== null && typeof value === "object"
            ? Object.fromEntries(Object.entries(value)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([k, v]) => [k, sort(v)]))
            : value;
    try {
        return JSON.stringify(sort(JSON.parse(document)));
    }
    catch {
        return document;
    }
};
export const ResourcePolicyProvider = () => Provider.effect(ResourcePolicy, Effect.gen(function* () {
    /** Read the live policy; typed not-found (policy or monitor) → undefined. */
    const describe = Effect.fn(function* (appMonitorName) {
        return yield* rum
            .getResourcePolicy({ Name: appMonitorName })
            .pipe(Effect.catchTag(["PolicyNotFoundException", "ResourceNotFoundException"], () => Effect.succeed(undefined)));
    });
    return {
        stables: ["appMonitorName"],
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return undefined;
            if (olds?.appMonitorName !== news.appMonitorName) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ olds, output }) {
            const appMonitorName = output?.appMonitorName ?? olds?.appMonitorName;
            if (!appMonitorName)
                return undefined;
            const policy = yield* describe(appMonitorName);
            if (policy === undefined)
                return undefined;
            // Resource policies are not taggable — ownership is implied by the
            // owned parent app monitor.
            return { appMonitorName, policyRevisionId: policy.PolicyRevisionId };
        }),
        reconcile: Effect.fn(function* ({ news, session }) {
            const appMonitorName = news.appMonitorName;
            // 1. Observe — the live policy is authoritative.
            const existing = yield* describe(appMonitorName);
            // 2/3. Ensure + sync — `putResourcePolicy` is a true upsert; call
            // it only when the canonical document drifts (the observed
            // revision id guards against concurrent writers).
            const policy = existing?.PolicyDocument !== undefined &&
                canonicalJson(existing.PolicyDocument) ===
                    canonicalJson(news.policyDocument)
                ? existing
                : yield* rum.putResourcePolicy({
                    Name: appMonitorName,
                    PolicyDocument: news.policyDocument,
                    PolicyRevisionId: existing?.PolicyRevisionId,
                });
            yield* session.note(appMonitorName);
            return {
                appMonitorName,
                policyRevisionId: policy.PolicyRevisionId,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* rum.deleteResourcePolicy({ Name: output.appMonitorName }).pipe(
            // idempotent — the policy (or its whole monitor) may be gone
            Effect.catchTag(["PolicyNotFoundException", "ResourceNotFoundException"], () => Effect.void), Effect.retry({
                while: (e) => e._tag === "ConflictException",
                schedule: Schedule.max([
                    Schedule.fixed("3 seconds"),
                    Schedule.recurs(8),
                ]),
            }));
        }),
        // Singleton sub-resource keyed by its parent app monitor.
        list: () => Effect.succeed([]),
    };
}));
//# sourceMappingURL=ResourcePolicy.js.map