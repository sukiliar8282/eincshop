import * as organizations from "@distilled.cloud/aws/organizations";
import * as Effect from "effect/Effect";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { collectPages, retryOrganizations } from "./common.js";
/**
 * Enables trusted access for an AWS service principal, allowing that service
 * to operate across all accounts in the organization.
 *
 * Typically paired with a {@link DelegatedAdministrator} that hands day-to-day
 * administration of the service to a member account. Existence-only resource:
 * changing `servicePrincipal` replaces it.
 * ### Enabling Trusted Access
 * **Example:** Enable IAM Identity Center
 * ```typescript
 * yield* TrustedServiceAccess("SsoTrustedAccess", {
 *   servicePrincipal: "sso.amazonaws.com",
 * });
 * ```
 *
 * **Example:** Trusted Access Plus a Delegated Administrator
 * ```typescript
 * const guardDutyAccess = yield* TrustedServiceAccess("GuardDutyAccess", {
 *   servicePrincipal: "guardduty.amazonaws.com",
 * });
 *
 * yield* DelegatedAdministrator("GuardDutyAdmin", {
 *   accountId: securityAccount.accountId,
 *   servicePrincipal: guardDutyAccess.servicePrincipal,
 * });
 * ```
 *
 * @resource
 */
export const TrustedServiceAccess = Resource("AWS.Organizations.TrustedServiceAccess");
export const TrustedServiceAccessProvider = () => Provider.effect(TrustedServiceAccess, Effect.gen(function* () {
    return {
        stables: ["servicePrincipal"],
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return;
            if (olds?.servicePrincipal !== news.servicePrincipal) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ olds, output }) {
            const servicePrincipal = output?.servicePrincipal ?? olds?.servicePrincipal;
            if (servicePrincipal === undefined) {
                // Output-valued props don't survive a `creating`-state round-trip
                // (they deserialize as `undefined`) — report "not found" so the
                // engine re-drives the create.
                return undefined;
            }
            return yield* readTrustedServiceAccess(servicePrincipal);
        }),
        list: () => Effect.gen(function* () {
            // Enumerate every service principal granted trusted access to the
            // organization. The list response already carries the full `read`
            // shape (servicePrincipal + dateEnabled), so each enabled principal
            // maps directly to one Attributes — no per-item hydration needed.
            const principals = yield* retryOrganizations(collectPages((NextToken) => organizations.listAWSServiceAccessForOrganization({
                NextToken,
            }), (page) => page.EnabledServicePrincipals));
            return principals
                .filter((candidate) => candidate.ServicePrincipal != null)
                .map((candidate) => ({
                servicePrincipal: candidate.ServicePrincipal,
                dateEnabled: candidate.DateEnabled,
            }));
        }).pipe(
        // Not an org management account (or lacking access) — there's no
        // organization to enumerate, so degrade to an empty list.
        Effect.catchTags({
            AWSOrganizationsNotInUseException: () => Effect.succeed([]),
            AccessDeniedException: () => Effect.succeed([]),
        })),
        reconcile: Effect.fn(function* ({ news, session }) {
            // Observe — fetch live trusted-access state. We never trust prior
            // `output` blindly; if access was disabled out-of-band we re-enable.
            let state = yield* readTrustedServiceAccess(news.servicePrincipal);
            // Ensure — enable trusted access if it's missing. This API is
            // effectively idempotent for already-enabled principals, but we
            // gate the call to avoid unnecessary churn.
            if (!state) {
                yield* retryOrganizations(organizations.enableAWSServiceAccess({
                    ServicePrincipal: news.servicePrincipal,
                }));
                state = yield* readTrustedServiceAccess(news.servicePrincipal);
                if (!state) {
                    return yield* Effect.fail(new Error(`trusted service access '${news.servicePrincipal}' not found after create`));
                }
            }
            yield* session.note(state.servicePrincipal);
            return state;
        }),
        delete: Effect.fn(function* ({ output }) {
            if (!(yield* readTrustedServiceAccess(output.servicePrincipal))) {
                return;
            }
            yield* retryOrganizations(organizations.disableAWSServiceAccess({
                ServicePrincipal: output.servicePrincipal,
            }));
        }),
    };
}));
const readTrustedServiceAccess = Effect.fn(function* (servicePrincipal) {
    const principals = yield* retryOrganizations(collectPages((NextToken) => organizations.listAWSServiceAccessForOrganization({ NextToken }), (page) => page.EnabledServicePrincipals));
    const match = principals.find((candidate) => candidate.ServicePrincipal === servicePrincipal);
    return match
        ? {
            servicePrincipal,
            dateEnabled: match.DateEnabled,
        }
        : undefined;
});
//# sourceMappingURL=TrustedServiceAccess.js.map