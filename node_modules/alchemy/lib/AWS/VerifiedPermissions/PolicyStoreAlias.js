import * as avp from "@distilled.cloud/aws/verifiedpermissions";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * A named alias for a Verified Permissions policy store. Aliases let callers
 * reference a policy store by a stable name (e.g. in `IsAuthorized`
 * requests) so the underlying store can be swapped without reconfiguring
 * clients.
 * ### Creating an Alias
 * **Example:** Alias with a Generated Name
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const store = yield* AWS.VerifiedPermissions.PolicyStore("Store", {});
 *
 * const alias = yield* AWS.VerifiedPermissions.PolicyStoreAlias("Alias", {
 *   policyStoreId: store.policyStoreId,
 * });
 * ```
 *
 * **Example:** Named Alias with Hard Delete
 * ```typescript
 * yield* AWS.VerifiedPermissions.PolicyStoreAlias("Alias", {
 *   policyStoreId: store.policyStoreId,
 *   aliasName: "photo-app-prod",
 *   deletionMode: "HardDelete",
 * });
 * ```
 *
 * @resource
 */
export const PolicyStoreAlias = Resource("AWS.VerifiedPermissions.PolicyStoreAlias");
const toAliasName = (id, props = {}) => props.aliasName
    ? Effect.succeed(props.aliasName)
    : createPhysicalName({ id, maxLength: 64, lowercase: true });
export const PolicyStoreAliasProvider = () => Provider.effect(PolicyStoreAlias, Effect.gen(function* () {
    const observe = Effect.fn(function* (aliasName) {
        return yield* avp
            .getPolicyStoreAlias({ aliasName })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    return PolicyStoreAlias.Provider.of({
        stables: ["aliasName", "policyStoreId", "aliasArn"],
        list: () => Effect.gen(function* () {
            const pages = yield* avp.listPolicyStoreAliases
                .pages({})
                .pipe(Stream.runCollect);
            const items = Array.from(pages).flatMap((page) => page.policyStoreAliases ?? []);
            return items.map((item) => ({
                aliasName: item.aliasName,
                policyStoreId: item.policyStoreId,
                aliasArn: item.aliasArn,
            }));
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const aliasName = output?.aliasName ??
                (olds !== undefined ? yield* toAliasName(id, olds) : undefined);
            if (aliasName === undefined)
                return undefined;
            const alias = yield* observe(aliasName);
            if (alias === undefined || alias.state === "PendingDeletion") {
                return undefined;
            }
            return {
                aliasName: alias.aliasName,
                policyStoreId: alias.policyStoreId,
                aliasArn: alias.aliasArn,
            };
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            // no UpdatePolicyStoreAlias API — name and target changes replace;
            // deletionMode only affects delete-time behavior
            if (olds.policyStoreId !== news.policyStoreId ||
                (news.aliasName !== undefined && olds.aliasName !== news.aliasName)) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const aliasName = output?.aliasName ?? (yield* toAliasName(id, news));
            // 1. OBSERVE — cloud state is authoritative
            const existing = yield* observe(aliasName);
            // 2. ENSURE — tolerate the AlreadyExists race
            if (existing === undefined || existing.state === "PendingDeletion") {
                const created = yield* avp
                    .createPolicyStoreAlias({
                    aliasName,
                    policyStoreId: news.policyStoreId,
                })
                    .pipe(Effect.catchTag("ConflictException", () => Effect.succeed(undefined)));
                if (created !== undefined) {
                    yield* session.note(created.aliasName);
                    return {
                        aliasName: created.aliasName,
                        policyStoreId: created.policyStoreId,
                        aliasArn: created.aliasArn,
                    };
                }
            }
            const alias = existing ?? (yield* observe(aliasName));
            if (alias === undefined) {
                return yield* Effect.fail(new Error(`policy store alias '${aliasName}' not found after create`));
            }
            yield* session.note(alias.aliasName);
            return {
                aliasName: alias.aliasName,
                policyStoreId: alias.policyStoreId,
                aliasArn: alias.aliasArn,
            };
        }),
        delete: Effect.fn(function* ({ olds, output }) {
            yield* avp
                .deletePolicyStoreAlias({
                aliasName: output.aliasName,
                deletionMode: olds.deletionMode ?? "HardDelete",
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=PolicyStoreAlias.js.map