import * as amp from "@distilled.cloud/aws/amp";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * The resource-based policy of an Amazon Managed Service for Prometheus
 * workspace — grants cross-account or fine-grained same-account access to
 * the workspace's data plane (remote-write, query). A workspace has at most
 * one.
 *
 * ### Creating a Resource Policy
 * **Example:** Allow Another Account to Query the Workspace
 * ```typescript
 * const workspace = yield* AMP.Workspace("Metrics", {});
 * const policy = yield* AMP.ResourcePolicy("Sharing", {
 *   workspaceId: workspace.workspaceId,
 *   policyDocument: JSON.stringify({
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { AWS: "arn:aws:iam::123456789012:root" },
 *         Action: ["aps:QueryMetrics"],
 *         Resource: workspace.workspaceArn,
 *       },
 *     ],
 *   }),
 * });
 * ```
 *
 * @resource
 */
export const ResourcePolicy = Resource("AWS.AMP.ResourcePolicy");
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
    /** Describe the policy; typed not-found → undefined. */
    const describe = Effect.fn(function* (workspaceId) {
        return yield* amp
            .describeResourcePolicy({ workspaceId })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    const toAttrs = (workspaceId, policy) => ({
        workspaceId,
        policyStatus: policy.policyStatus,
        revisionId: policy.revisionId,
    });
    return {
        stables: ["workspaceId"],
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return undefined;
            if (olds?.workspaceId !== news.workspaceId) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ olds, output }) {
            const workspaceId = output?.workspaceId ?? olds?.workspaceId;
            if (!workspaceId)
                return undefined;
            const policy = yield* describe(workspaceId);
            if (policy === undefined)
                return undefined;
            // Resource policies are not taggable — ownership is implied by
            // the owned parent workspace.
            return toAttrs(workspaceId, policy);
        }),
        reconcile: Effect.fn(function* ({ news, session }) {
            const workspaceId = news.workspaceId;
            // 1. Observe — the live policy is authoritative.
            const existing = yield* describe(workspaceId);
            // 2/3. Ensure + sync — `putResourcePolicy` is a true upsert;
            // call it only when the canonical document drifts.
            const policy = existing !== undefined &&
                canonicalJson(existing.policyDocument) ===
                    canonicalJson(news.policyDocument)
                ? existing
                : yield* amp.putResourcePolicy({
                    workspaceId,
                    policyDocument: news.policyDocument,
                    revisionId: existing?.revisionId,
                });
            yield* session.note(workspaceId);
            return toAttrs(workspaceId, policy);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* amp
                .deleteResourcePolicy({ workspaceId: output.workspaceId })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void), Effect.retry({
                while: (e) => e._tag === "ConflictException",
                schedule: Schedule.max([
                    Schedule.fixed("3 seconds"),
                    Schedule.recurs(20),
                ]),
            }));
        }),
        // Singleton sub-resource keyed by its parent workspace.
        list: () => Effect.succeed([]),
    };
}));
//# sourceMappingURL=ResourcePolicy.js.map