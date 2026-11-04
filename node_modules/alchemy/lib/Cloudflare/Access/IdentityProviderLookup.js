import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as Stream from "effect/Stream";
/**
 * IdP types that can exist at most once per scope (the managed Cloudflare
 * WARP login method and the built-in one-time PIN). They are located by
 * type — their display name is user-irrelevant and often empty (`""` for
 * the dashboard-provisioned `cloudflare` IdP).
 */
export const isSingletonType = (type) => type === "onetimepin" || type === "cloudflare";
/**
 * Read an identity provider by id, mapping "gone"
 * (`AccessIdentityProviderNotFound`, Cloudflare error code 12135 —
 * `access.api.error.not_found`) to `undefined`. Zone-level when `zoneId`
 * is set, account-level otherwise.
 */
export const getIdp = (zoneId, accountId, identityProviderId) => (zoneId !== undefined
    ? zeroTrust.getIdentityProviderForZone({ zoneId, identityProviderId })
    : zeroTrust.getIdentityProviderForAccount({ accountId, identityProviderId })).pipe(Effect.map((idp) => idp), Effect.catchTag("AccessIdentityProviderNotFound", () => Effect.succeed(undefined)));
/**
 * Find the first identity provider in the scope matching a predicate.
 */
export const findFirst = (zoneId, accountId, predicate) => (zoneId !== undefined
    ? zeroTrust.listIdentityProvidersForZone.items({ zoneId })
    : zeroTrust.listIdentityProvidersForAccount.items({ accountId })).pipe(Stream.filter(predicate), Stream.runHead, Effect.map(Option.getOrUndefined), Effect.map((idp) => idp));
/**
 * Find an identity provider by exact name within the scope. Names are
 * not unique on Cloudflare's side; pick the first match.
 */
export const findByName = (zoneId, accountId, name) => findFirst(zoneId, accountId, (idp) => idp.name === name);
/**
 * Find an identity provider by type within the scope — the identity of
 * the {@link isSingletonType singleton} types, whose display name carries
 * no information.
 */
export const findByType = (zoneId, accountId, type) => findFirst(zoneId, accountId, (idp) => idp.type === type);
export const toAttributes = (idp, zoneId, accountId, priorSecret) => ({
    identityProviderId: idp.id ?? "",
    accountId,
    zoneId,
    name: idp.name,
    type: idp.type,
    scimBaseUrl: idp.scimConfig?.scimBaseUrl ?? undefined,
    // The SCIM secret is returned once when SCIM is enabled; afterwards the
    // API masks it — carry the prior value forward.
    scimSecret: idp.scimConfig?.secret
        ? Redacted.make(idp.scimConfig.secret)
        : priorSecret,
    scimEnabled: idp.scimConfig?.enabled ?? false,
});
//# sourceMappingURL=IdentityProviderLookup.js.map