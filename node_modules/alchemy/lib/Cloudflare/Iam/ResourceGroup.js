import * as iam from "@distilled.cloud/cloudflare/iam";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.Iam.ResourceGroup";
/**
 * A Cloudflare IAM resource group — a named set of account resources
 * (zones, or the whole account) that fine-grained policies attach to.
 *
 * Resource groups pair with permission groups inside a user group policy:
 * the permission group says *what* actions are allowed, the resource group
 * says *which* resources they apply to. Both `name` and `scope` are mutable
 * in place.
 *
 * Account-scoped IAM (resource groups, user groups) is an Enterprise
 * feature.
 * ### Creating a Resource Group
 * **Example:** Scope a group to the whole account
 * ```typescript
 * const { accountId } = yield* yield* Cloudflare.CloudflareEnvironment;
 * const group = yield* Cloudflare.Iam.ResourceGroup("AllResources", {
 *   scope: {
 *     key: `com.cloudflare.api.account.${accountId}`,
 *     objects: [{ key: "*" }],
 *   },
 * });
 * ```
 *
 * **Example:** Scope a group to a single zone
 * ```typescript
 * const group = yield* Cloudflare.Iam.ResourceGroup("ZoneOnly", {
 *   name: "my-zone-resources",
 *   scope: {
 *     key: `com.cloudflare.api.account.${accountId}`,
 *     objects: [
 *       { key: `com.cloudflare.api.account.zone.${zone.zoneId}` },
 *     ],
 *   },
 * });
 * ```
 *
 * ### Using with User Groups
 * **Example:** Attach to a user group policy
 * ```typescript
 * yield* Cloudflare.Iam.UserGroup("Readers", {
 *   policies: [
 *     {
 *       access: "allow",
 *       permissionGroups: [readOnlyPermissionGroupId],
 *       resourceGroups: [group.resourceGroupId],
 *     },
 *   ],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/fundamentals/manage-members/scoped-roles/
 *
 * @resource
 * @product IAM
 * @category Account & Identity
 */
export const ResourceGroup = Resource(TypeId);
/**
 * Returns true if the given value is an ResourceGroup resource.
 */
export const isResourceGroup = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const ResourceGroupProvider = () => Provider.succeed(ResourceGroup, {
    stables: ["resourceGroupId", "accountId"],
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        if (output?.resourceGroupId) {
            const observed = yield* getResourceGroup(acct, output.resourceGroupId);
            if (observed)
                return toAttributes(observed, acct);
            return undefined;
        }
        // Cold read — recover from lost state by matching the deterministic
        // physical name. Names are not unique on Cloudflare's side; an exact
        // match on our generated/explicit name is the best identity we have.
        const name = yield* createGroupName(id, olds?.name);
        const match = yield* findByName(acct, name);
        return match ? toAttributes(match, acct) : undefined;
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const name = yield* createGroupName(id, news.name);
        // Inputs have been resolved to concrete strings by Plan.
        const desiredScope = resolveScope(news.scope);
        // 1. Observe — the id cached on `output` is a hint, not a guarantee:
        //    a missing group falls through to the name scan and then create.
        let observed = output?.resourceGroupId
            ? yield* getResourceGroup(accountId, output.resourceGroupId)
            : undefined;
        if (!observed) {
            observed = yield* findByName(accountId, name);
        }
        // 2. Ensure — create when missing. Names are not unique on
        //    Cloudflare's side, so there is no AlreadyExists race to tolerate.
        if (!observed) {
            const created = yield* iam.createResourceGroup({
                accountId,
                name,
                scope: desiredScope,
            });
            return toAttributes(created, accountId);
        }
        // 3. Sync — diff observed name/scope against desired; the update is
        //    a PUT, so send the full body, but skip the call on a no-op.
        const observedScope = parseScope(observed.scope);
        const dirty = (observed.name ?? "") !== name ||
            !sameScope(observedScope, desiredScope);
        if (!dirty) {
            return toAttributes(observed, accountId);
        }
        const updated = yield* iam.updateResourceGroup({
            accountId,
            resourceGroupId: observed.id,
            name,
            scope: desiredScope,
        });
        return toAttributes(updated, accountId);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* iam
            .deleteResourceGroup({
            accountId: output.accountId,
            resourceGroupId: output.resourceGroupId,
        })
            .pipe(Effect.catchTag("ResourceGroupNotFound", () => Effect.void));
    }),
    // Account collection — the list op returns the full group record (id,
    // name, scope) per page, so each item maps straight to the `read`
    // Attributes shape without a per-item GET. Predefined/system resource
    // groups are returned alongside ours, so a read-only list is often
    // non-empty. Cloudflare paginates a single page set; exhaust it.
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* iam.listResourceGroups.pages({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? [])
            // Cloudflare seeds every account with predefined, non-editable
            // system resource groups named `com.cloudflare.api.account.*`.
            // They can't be deleted (`UnprocessableEntity: non-editable`),
            // so exclude them from enumeration.
            .filter((group) => !isSystemGroupName(group.name))
            .map((group) => toAttributes(group, accountId)))));
    }),
});
/**
 * Cloudflare's predefined, non-editable account resource groups use the
 * reserved `com.cloudflare.api.account.*` name. They are seeded on every
 * account and cannot be deleted, so they must be excluded from enumeration.
 */
const isSystemGroupName = (name) => (name ?? "").startsWith("com.cloudflare.api.");
/**
 * Read a resource group by id, mapping "gone" (`ResourceGroupNotFound`,
 * HTTP 404 / Cloudflare error code 404) to `undefined`.
 */
const getResourceGroup = (accountId, resourceGroupId) => iam.getResourceGroup({ accountId, resourceGroupId }).pipe(Effect.map((g) => g), Effect.catchTag("ResourceGroupNotFound", () => Effect.succeed(undefined)));
/**
 * Find a resource group by exact name. Names are not unique on
 * Cloudflare's side; pick the lexicographically-first id for determinism.
 */
const findByName = (accountId, name) => iam.listResourceGroups.items({ accountId, name }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
    .filter((g) => g.name === name)
    .sort((a, b) => a.id.localeCompare(b.id))
    .at(0)));
const createGroupName = (id, name) => Effect.gen(function* () {
    return name ?? (yield* createPhysicalName({ id, lowercase: true }));
});
/** Resolve `Input<string>` scope fields to concrete strings (post-Plan). */
const resolveScope = (scope) => ({
    key: scope.key,
    objects: scope.objects.map((o) => ({ key: o.key })),
});
/**
 * Decode the `unknown`-typed observed scope into our structured shape.
 * Cloudflare always returns `{ key, objects: [{ key }] }` for a persisted
 * resource group.
 */
const parseScope = (scope) => {
    const key = Predicate.hasProperty(scope, "key") && typeof scope.key === "string"
        ? scope.key
        : "";
    const objects = Predicate.hasProperty(scope, "objects") && Array.isArray(scope.objects)
        ? scope.objects.flatMap((o) => Predicate.hasProperty(o, "key") && typeof o.key === "string"
            ? [{ key: o.key }]
            : [])
        : [];
    return { key, objects };
};
const sameScope = (a, b) => a.key === b.key &&
    a.objects.length === b.objects.length &&
    a.objects
        .map((o) => o.key)
        .sort()
        .join(",") ===
        b.objects
            .map((o) => o.key)
            .sort()
            .join(",");
const toAttributes = (group, accountId) => ({
    resourceGroupId: group.id,
    accountId,
    name: group.name ?? "",
    scope: parseScope(group.scope),
});
//# sourceMappingURL=ResourceGroup.js.map