import * as avp from "@distilled.cloud/aws/verifiedpermissions";
import * as Effect from "effect/Effect";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * A static Cedar policy in a Verified Permissions policy store. Static
 * policies contain a complete Cedar statement and are evaluated for every
 * matching authorization request.
 * ### Creating Policies
 * **Example:** Permit a Specific Principal
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const store = yield* AWS.VerifiedPermissions.PolicyStore("Store", {});
 *
 * yield* AWS.VerifiedPermissions.Policy("AllowAlice", {
 *   policyStoreId: store.policyStoreId,
 *   statement: `permit(
 *     principal == PhotoApp::User::"alice",
 *     action == PhotoApp::Action::"viewPhoto",
 *     resource
 *   );`,
 *   description: "Alice can view any photo",
 * });
 * ```
 *
 * ### Template-Linked Policies
 * **Example:** Instantiate a Policy Template for a Principal
 * ```typescript
 * const template = yield* AWS.VerifiedPermissions.PolicyTemplate("ViewPhoto", {
 *   policyStoreId: store.policyStoreId,
 *   statement: `permit(
 *     principal == ?principal,
 *     action == PhotoApp::Action::"viewPhoto",
 *     resource
 *   );`,
 * });
 *
 * yield* AWS.VerifiedPermissions.Policy("AliceCanView", {
 *   policyStoreId: store.policyStoreId,
 *   templateId: template.policyTemplateId,
 *   principal: { entityType: "PhotoApp::User", entityId: "alice" },
 * });
 * ```
 *
 * @resource
 */
export const Policy = Resource("AWS.VerifiedPermissions.Policy");
/** Desired props → the wire `PolicyDefinition` union. */
const toDefinition = (news) => Effect.gen(function* () {
    if (news.templateId !== undefined && news.statement !== undefined) {
        return yield* Effect.fail(new Error("a Policy accepts either `statement` (static) or `templateId` (template-linked), not both"));
    }
    if (news.templateId !== undefined) {
        return {
            templateLinked: {
                policyTemplateId: news.templateId,
                principal: news.principal,
                resource: news.resource,
            },
        };
    }
    if (news.statement === undefined) {
        return yield* Effect.fail(new Error("a Policy requires either `statement` (static) or `templateId` (template-linked)"));
    }
    return {
        static: { statement: news.statement, description: news.description },
    };
});
export const PolicyProvider = () => Provider.effect(Policy, Effect.gen(function* () {
    const observe = Effect.fn(function* (policyStoreId, policyId) {
        return yield* avp
            .getPolicy({ policyStoreId, policyId })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    return Policy.Provider.of({
        stables: ["policyStoreId", "policyId"],
        // child of a policy store — not enumerable account-wide
        list: () => Effect.succeed([]),
        read: Effect.fn(function* ({ olds, output }) {
            const policyStoreId = output?.policyStoreId ?? olds?.policyStoreId;
            const policyId = output?.policyId;
            if (policyStoreId === undefined || policyId === undefined) {
                return undefined;
            }
            const policy = yield* observe(policyStoreId, policyId);
            if (policy === undefined)
                return undefined;
            return { policyStoreId, policyId: policy.policyId };
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            if (olds.policyStoreId !== news.policyStoreId) {
                return { action: "replace" };
            }
            // switching static <-> template-linked replaces; UpdatePolicy only
            // supports static definitions, and a template-linked policy's
            // template/principal/resource are fixed at creation
            if ((olds.templateId === undefined) !==
                (news.templateId === undefined) ||
                (news.templateId !== undefined &&
                    (olds.templateId !== news.templateId ||
                        olds.principal?.entityType !== news.principal?.entityType ||
                        olds.principal?.entityId !== news.principal?.entityId ||
                        olds.resource?.entityType !== news.resource?.entityType ||
                        olds.resource?.entityId !== news.resource?.entityId))) {
                return { action: "replace" };
            }
            // static statement / description are mutable → default update path
        }),
        reconcile: Effect.fn(function* ({ news, output, session }) {
            const definition = yield* toDefinition(news);
            // 1. OBSERVE — cloud state is authoritative
            const existing = output?.policyId !== undefined
                ? yield* observe(news.policyStoreId, output.policyId)
                : undefined;
            // 2. ENSURE / SYNC
            let policyId;
            if (existing === undefined) {
                const created = yield* avp.createPolicy({
                    policyStoreId: news.policyStoreId,
                    definition,
                });
                policyId = created.policyId;
            }
            else if ("static" in definition &&
                definition.static !== undefined) {
                const updated = yield* avp.updatePolicy({
                    policyStoreId: news.policyStoreId,
                    policyId: existing.policyId,
                    definition: { static: definition.static },
                });
                policyId = updated.policyId;
            }
            else {
                // template-linked policies have no in-place update — diff replaces
                // on any change, so the observed policy is already converged
                policyId = existing.policyId;
            }
            yield* session.note(policyId);
            return { policyStoreId: news.policyStoreId, policyId };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* avp
                .deletePolicy({
                policyStoreId: output.policyStoreId,
                policyId: output.policyId,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=Policy.js.map