import * as avp from "@distilled.cloud/aws/verifiedpermissions";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
const unwrap = (v) => v === undefined ? undefined : Redacted.isRedacted(v) ? Redacted.value(v) : v;
/**
 * A Cedar policy template in a Verified Permissions policy store. Templates
 * contain `?principal` / `?resource` placeholders; template-linked policies
 * instantiate the template for a concrete principal and resource, and every
 * linked policy automatically picks up template updates.
 * ### Creating Policy Templates
 * **Example:** Template with a Principal Placeholder
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const store = yield* AWS.VerifiedPermissions.PolicyStore("Store", {});
 *
 * const template = yield* AWS.VerifiedPermissions.PolicyTemplate("ViewPhoto", {
 *   policyStoreId: store.policyStoreId,
 *   statement: `permit(
 *     principal == ?principal,
 *     action == PhotoApp::Action::"viewPhoto",
 *     resource
 *   );`,
 *   description: "Grant a user access to view photos",
 * });
 * ```
 *
 * **Example:** Link a Policy to the Template
 * ```typescript
 * yield* AWS.VerifiedPermissions.Policy("AliceCanView", {
 *   policyStoreId: store.policyStoreId,
 *   templateId: template.policyTemplateId,
 *   principal: { entityType: "PhotoApp::User", entityId: "alice" },
 * });
 * ```
 *
 * @resource
 */
export const PolicyTemplate = Resource("AWS.VerifiedPermissions.PolicyTemplate");
export const PolicyTemplateProvider = () => Provider.effect(PolicyTemplate, Effect.gen(function* () {
    const observe = Effect.fn(function* (policyStoreId, policyTemplateId) {
        return yield* avp
            .getPolicyTemplate({ policyStoreId, policyTemplateId })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    return PolicyTemplate.Provider.of({
        stables: ["policyStoreId", "policyTemplateId"],
        // child of a policy store — not enumerable account-wide
        list: () => Effect.succeed([]),
        read: Effect.fn(function* ({ olds, output }) {
            const policyStoreId = output?.policyStoreId ?? olds?.policyStoreId;
            const policyTemplateId = output?.policyTemplateId;
            if (policyStoreId === undefined || policyTemplateId === undefined) {
                return undefined;
            }
            const template = yield* observe(policyStoreId, policyTemplateId);
            if (template === undefined)
                return undefined;
            return { policyStoreId, policyTemplateId: template.policyTemplateId };
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            if (olds.policyStoreId !== news.policyStoreId) {
                return { action: "replace" };
            }
            // statement / description are mutable → default update path
        }),
        reconcile: Effect.fn(function* ({ news, output, session }) {
            // 1. OBSERVE — cloud state is authoritative
            const existing = output?.policyTemplateId !== undefined
                ? yield* observe(news.policyStoreId, output.policyTemplateId)
                : undefined;
            // 2. ENSURE
            if (existing === undefined) {
                const created = yield* avp.createPolicyTemplate({
                    policyStoreId: news.policyStoreId,
                    statement: news.statement,
                    description: news.description,
                });
                yield* session.note(created.policyTemplateId);
                return {
                    policyStoreId: news.policyStoreId,
                    policyTemplateId: created.policyTemplateId,
                };
            }
            // 3. SYNC — diff observed statement/description against desired
            const observedStatement = unwrap(existing.statement);
            const observedDescription = unwrap(existing.description);
            if (observedStatement !== news.statement ||
                observedDescription !== (news.description ?? undefined)) {
                yield* avp.updatePolicyTemplate({
                    policyStoreId: news.policyStoreId,
                    policyTemplateId: existing.policyTemplateId,
                    statement: news.statement,
                    description: news.description,
                });
            }
            yield* session.note(existing.policyTemplateId);
            return {
                policyStoreId: news.policyStoreId,
                policyTemplateId: existing.policyTemplateId,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* avp
                .deletePolicyTemplate({
                policyStoreId: output.policyStoreId,
                policyTemplateId: output.policyTemplateId,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=PolicyTemplate.js.map