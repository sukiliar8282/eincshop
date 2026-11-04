import * as ssoAdmin from "@distilled.cloud/aws/sso-admin";
import * as Effect from "effect/Effect";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { listInstances, resolveInstance, retryIdentityCenter, toInstanceAttributes, } from "./common.js";
/**
 * An IAM Identity Center instance visible to the current account.
 *
 * Use `mode: "existing"` to adopt a pre-enabled organization instance. Use
 * `mode: "account"` only for standalone or member-account account instances.
 * ### Discovering Existing Instances
 * **Example:** Adopt An Existing Instance
 * ```typescript
 * const instance = yield* Instance("IdentityCenter", {
 *   mode: "existing",
 * });
 * ```
 *
 * ### Creating Account Instances
 * **Example:** Create A Member Account Instance
 * ```typescript
 * const instance = yield* Instance("IdentityCenter", {
 *   mode: "account",
 *   name: "customer-a",
 * });
 * ```
 *
 * @resource
 */
export const Instance = Resource("AWS.IdentityCenter.Instance");
export const InstanceProvider = () => Provider.effect(Instance, Effect.gen(function* () {
    return {
        stables: ["instanceArn", "identityStoreId", "ownerAccountId", "mode"],
        // Enumerate every Identity Center instance visible to the calling
        // account (organization + account instances). `ListInstances` is
        // paginated and fully hydrates each `InstanceMetadata`, so no
        // per-item read is needed. Accounts with no SSO enabled return an
        // empty list (not an error). Each item is mapped to the exact `read`
        // Attributes shape; `mode` defaults to "existing" since enumeration
        // only observes pre-existing instances.
        list: () => Effect.gen(function* () {
            const instances = yield* listInstances();
            return instances
                .filter((instance) => instance.InstanceArn != null &&
                instance.IdentityStoreId != null)
                .map((instance) => ({
                ...toInstanceAttributes(instance),
                mode: "existing",
            }));
        }),
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return;
            if (olds?.instanceArn !== news.instanceArn ||
                olds?.mode !== news.mode ||
                olds?.name !== news.name) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ olds, output }) {
            const mode = output?.mode ?? olds?.mode ?? "existing";
            const instance = yield* readInstance({
                instanceArn: output?.instanceArn ?? olds?.instanceArn,
                name: olds?.name,
            });
            return instance ? { ...instance, mode } : undefined;
        }),
        reconcile: Effect.fn(function* ({ news, output, session }) {
            const mode = output?.mode ?? news.mode ?? "existing";
            // Observe — try to find a visible instance, preferring an
            // explicit ARN (from output or props) and otherwise scanning
            // the account.
            const existing = yield* readInstance({
                instanceArn: output?.instanceArn ?? news.instanceArn,
                name: news.name,
            });
            if (existing) {
                yield* session.note(existing.instanceArn);
                return {
                    ...existing,
                    mode,
                };
            }
            // Ensure — for `existing` mode we cannot create one; fail.
            // Organization instances must be enabled manually in the
            // management account.
            if (mode !== "account") {
                return yield* Effect.fail(new Error("No visible Identity Center instance was found. Organization instances must be enabled manually in the management account before Alchemy can adopt them."));
            }
            // Ensure — `account` mode creates an account instance.
            const response = yield* retryIdentityCenter(ssoAdmin.createInstance({
                Name: news.name,
            }));
            const created = yield* readInstance({
                instanceArn: response.InstanceArn,
                name: news.name,
            });
            if (!created) {
                return yield* Effect.fail(new Error("failed to resolve Identity Center instance after create"));
            }
            yield* session.note(created.instanceArn);
            return {
                ...created,
                mode,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            if (output.mode !== "account") {
                return;
            }
            const existing = yield* readInstance({
                instanceArn: output.instanceArn,
            });
            if (!existing) {
                return;
            }
            yield* retryIdentityCenter(ssoAdmin.deleteInstance({
                InstanceArn: output.instanceArn,
            }));
        }),
    };
}));
const readInstance = Effect.fn(function* ({ instanceArn, name, }) {
    if (instanceArn) {
        const instance = yield* resolveInstance(instanceArn).pipe(Effect.catch(() => Effect.succeed(undefined)));
        return instance ? toInstanceAttributes(instance) : undefined;
    }
    const instances = yield* listInstances();
    const match = instances.find((instance) => instance.Name === name) ??
        (instances.length === 1 ? instances[0] : undefined) ??
        instances.find((instance) => instance.Status === "ACTIVE");
    return match?.InstanceArn && match.IdentityStoreId
        ? toInstanceAttributes(match)
        : undefined;
});
//# sourceMappingURL=Instance.js.map