import * as acmpca from "@distilled.cloud/aws/acm-pca";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
const DEFAULT_PRINCIPAL = "acm.amazonaws.com";
const DEFAULT_ACTIONS = [
    "IssueCertificate",
    "GetCertificate",
    "ListPermissions",
];
/**
 * A permission on a private CA granted to the Certificate Manager (ACM)
 * service principal, allowing ACM to automatically issue and renew ACM
 * certificates signed by the CA.
 * ### Granting Permissions
 * **Example:** Allow ACM to auto-renew certificates
 * ```typescript
 * import * as ACMPCA from "alchemy/AWS/ACMPCA";
 *
 * const permission = yield* ACMPCA.Permission("AcmRenewal", {
 *   certificateAuthorityArn: ca.certificateAuthorityArn,
 * });
 * ```
 *
 * **Example:** Restrict the granted actions
 * ```typescript
 * const permission = yield* ACMPCA.Permission("AcmIssueOnly", {
 *   certificateAuthorityArn: ca.certificateAuthorityArn,
 *   actions: ["IssueCertificate", "GetCertificate"],
 * });
 * ```
 *
 * @resource
 */
export const Permission = Resource("AWS.ACMPCA.Permission");
const sortedActions = (actions) => JSON.stringify([...(actions ?? [])].sort());
export const PermissionProvider = () => Provider.effect(Permission, Effect.gen(function* () {
    // Find the permission entry for a principal on a CA. A missing or
    // deleted CA yields "no permission" for observation purposes.
    const findPermission = Effect.fn(function* (certificateAuthorityArn, principal) {
        return yield* acmpca.listPermissions
            .items({ CertificateAuthorityArn: certificateAuthorityArn })
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).find((p) => p.Principal === principal)), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    return {
        stables: ["certificateAuthorityArn", "principal"],
        list: () => Effect.gen(function* () {
            // Permissions hang off CAs: enumerate every non-deleted CA in
            // the ambient account/region and collect its permissions.
            const cas = yield* acmpca.listCertificateAuthorities.items({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
                .filter((ca) => ca.Arn !== undefined && ca.Status !== "DELETED")
                .map((ca) => ca.Arn)));
            const perCa = yield* Effect.forEach(cas, (arn) => acmpca.listPermissions
                .items({ CertificateAuthorityArn: arn })
                .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
                .filter((p) => p.Principal !== undefined)
                .map((p) => ({
                certificateAuthorityArn: arn,
                principal: p.Principal,
            }))), 
            // CA removed (or state-blocked) between enumeration and
            // listPermissions — it has no listable permissions.
            Effect.catchTag(["ResourceNotFoundException", "InvalidStateException"], () => Effect.succeed([]))), { concurrency: 5 });
            return perCa.flat();
        }),
        read: Effect.fn(function* ({ olds, output }) {
            const arn = output?.certificateAuthorityArn ?? olds?.certificateAuthorityArn;
            if (arn === undefined)
                return undefined;
            const principal = output?.principal ?? olds?.principal ?? DEFAULT_PRINCIPAL;
            const found = yield* findPermission(arn, principal);
            if (found === undefined)
                return undefined;
            return { certificateAuthorityArn: arn, principal };
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return;
            if (news.certificateAuthorityArn !== olds.certificateAuthorityArn ||
                (news.principal ?? DEFAULT_PRINCIPAL) !==
                    (olds.principal ?? DEFAULT_PRINCIPAL) ||
                news.sourceAccount !== olds.sourceAccount) {
                return { action: "replace" };
            }
            // actions changes converge through the default update path.
        }),
        reconcile: Effect.fn(function* ({ news, session }) {
            const principal = news.principal ?? DEFAULT_PRINCIPAL;
            const actions = news.actions ?? DEFAULT_ACTIONS;
            // OBSERVE — the permission has no update API, so converge by
            // comparing the observed action set and recreating on drift.
            const existing = yield* findPermission(news.certificateAuthorityArn, principal);
            const converged = existing !== undefined &&
                sortedActions(existing.Actions) === sortedActions(actions) &&
                (news.sourceAccount === undefined ||
                    existing.SourceAccount === news.sourceAccount);
            if (!converged) {
                if (existing !== undefined) {
                    yield* acmpca
                        .deletePermission({
                        CertificateAuthorityArn: news.certificateAuthorityArn,
                        Principal: principal,
                        SourceAccount: news.sourceAccount,
                    })
                        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
                }
                yield* acmpca
                    .createPermission({
                    CertificateAuthorityArn: news.certificateAuthorityArn,
                    Principal: principal,
                    SourceAccount: news.sourceAccount,
                    Actions: actions,
                })
                    .pipe(
                // A concurrent reconciler won the create race — the
                // permission exists; treat as converged.
                Effect.catchTag("PermissionAlreadyExistsException", () => Effect.void));
            }
            yield* session.note(`Permission for ${principal} on ${news.certificateAuthorityArn}`);
            return {
                certificateAuthorityArn: news.certificateAuthorityArn,
                principal,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* acmpca
                .deletePermission({
                CertificateAuthorityArn: output.certificateAuthorityArn,
                Principal: output.principal,
            })
                .pipe(
            // CA already gone, or in a state (DELETED) where permissions
            // are no longer addressable — the permission is gone with it.
            Effect.catchTag(["ResourceNotFoundException", "InvalidStateException"], () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=Permission.js.map