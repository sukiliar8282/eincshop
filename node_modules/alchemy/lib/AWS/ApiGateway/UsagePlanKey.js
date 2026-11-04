import * as ag from "@distilled.cloud/aws/api-gateway";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * Associates an API key with a usage plan.
 *
 * ### Usage plan keys
 * **Example:** Associate key with plan
 * ```typescript
 * yield* ApiGateway.UsagePlanKey("PlanKey", {
 *   usagePlanId: plan.id,
 *   keyId: key.id,
 * });
 * ```
 */
const UsagePlanKeyResource = Resource("AWS.ApiGateway.UsagePlanKey");
export { UsagePlanKeyResource as UsagePlanKey };
export const UsagePlanKeyProvider = () => Provider.effect(UsagePlanKeyResource, Effect.gen(function* () {
    return {
        stables: ["usagePlanId", "keyId"],
        diff: Effect.fn(function* ({ news: newsIn, olds }) {
            if (!isResolved(newsIn))
                return;
            const news = newsIn;
            if (news.usagePlanId !== olds.usagePlanId ||
                news.keyId !== olds.keyId) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ output }) {
            if (!output)
                return undefined;
            const k = yield* ag
                .getUsagePlanKey({
                usagePlanId: output.usagePlanId,
                keyId: output.keyId,
            })
                .pipe(Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
            if (!k?.id)
                return undefined;
            return {
                usagePlanId: output.usagePlanId,
                keyId: k.id,
                keyType: k.type ?? "API_KEY",
                name: k.name,
            };
        }),
        reconcile: Effect.fn(function* ({ news: newsIn, output, session }) {
            if (!isResolved(newsIn)) {
                return yield* Effect.die("UsagePlanKey props were not resolved");
            }
            const news = newsIn;
            const usagePlanId = (output?.usagePlanId ??
                news.usagePlanId);
            const keyId = (output?.keyId ?? news.keyId);
            // Observe — fetch the live link. UsagePlanKey is a pure
            // association (no patchable fields apart from the natural-key
            // tuple, which is modeled as `replace` in `diff`), so once it
            // exists there's nothing to sync.
            let observed = yield* ag
                .getUsagePlanKey({ usagePlanId, keyId })
                .pipe(Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
            // Ensure — create the link if missing.
            if (!observed?.id) {
                const created = yield* ag.createUsagePlanKey({
                    usagePlanId: news.usagePlanId,
                    keyId: news.keyId,
                    keyType: news.keyType ?? "API_KEY",
                });
                yield* session.note(`Linked key ${news.keyId} to usage plan ${news.usagePlanId}`);
                observed = yield* ag.getUsagePlanKey({
                    usagePlanId,
                    keyId: created.id ?? keyId,
                });
            }
            return {
                usagePlanId,
                keyId: observed.id,
                keyType: observed.type ?? "API_KEY",
                name: observed.name,
            };
        }),
        // UsagePlanKey is a sub-resource keyed by {usagePlanId, keyId}. There
        // is no account-wide enumeration, so enumerate every usage plan first
        // (getUsagePlans) then list keys per plan (getUsagePlanKeys).
        list: () => Effect.gen(function* () {
            const usagePlanIds = yield* ag.getUsagePlans.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.items ?? [])
                .filter((p) => p.id != null)
                .map((p) => p.id))));
            const rows = yield* Effect.forEach(usagePlanIds, (usagePlanId) => ag.getUsagePlanKeys.pages({ usagePlanId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.items ?? [])
                .filter((k) => k.id != null)
                .map((k) => ({
                usagePlanId,
                keyId: k.id,
                keyType: k.type ?? "API_KEY",
                name: k.name,
            }))))), { concurrency: 10 });
            return rows.flat();
        }),
        delete: Effect.fn(function* ({ output, session }) {
            yield* ag
                .deleteUsagePlanKey({
                usagePlanId: output.usagePlanId,
                keyId: output.keyId,
            })
                .pipe(Effect.catchTag("NotFoundException", () => Effect.void));
            yield* session.note(`Removed key from usage plan`);
        }),
    };
}));
//# sourceMappingURL=UsagePlanKey.js.map