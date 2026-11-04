import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { listAllZones } from "../Zone/lookup.js";
import { findByName, findByType, getIdp, isSingletonType, toAttributes, } from "./IdentityProviderLookup.js";
const TypeId = "Cloudflare.Access.IdentityProvider";
/**
 * A Cloudflare Zero Trust Access identity provider — the login method
 * (one-time PIN, generic OIDC/SAML, or a named provider like GitHub,
 * Google, Okta, or Azure AD) users authenticate with before Access
 * policies evaluate.
 *
 * Props are a discriminated union on `type`: each provider type only
 * accepts (and requires) its own config fields, so a missing
 * `directoryId` on an `azureAD` IdP or a GitHub config on an `oidc` IdP
 * is a compile-time error. The `type` is immutable (config shapes are
 * disjoint per type — changing it replaces the IdP); name, config, and
 * SCIM settings converge in place. Cloudflare masks secret config fields
 * (`clientSecret`, API tokens) on read, so those fields diff against
 * your previously declared props instead of observed cloud state.
 *
 * By default the IdP is created at the account level (the modern Zero
 * Trust organization scope); pass `zoneId` to scope it to a single zone
 * (legacy zone-level Access). Moving between scopes replaces the IdP.
 * ### Creating an Identity Provider
 * **Example:** One-time PIN (no external dependencies)
 * ```typescript
 * const otp = yield* Cloudflare.Access.IdentityProvider("Pin", {
 *   type: "onetimepin",
 * });
 * ```
 *
 * **Example:** Generic OIDC provider
 * ```typescript
 * const oidc = yield* Cloudflare.Access.IdentityProvider("Sso", {
 *   type: "oidc",
 *   config: {
 *     clientId: "my-client-id",
 *     clientSecret: "my-client-secret",
 *     authUrl: "https://idp.example.com/authorize",
 *     tokenUrl: "https://idp.example.com/token",
 *     certsUrl: "https://idp.example.com/keys",
 *     scopes: ["openid", "email", "profile"],
 *   },
 * });
 * ```
 *
 * **Example:** Microsoft Entra ID (Azure AD)
 * ```typescript
 * const entra = yield* Cloudflare.Access.IdentityProvider("Entra", {
 *   type: "azureAD",
 *   config: {
 *     clientId: "my-client-id",
 *     clientSecret: "my-client-secret",
 *     directoryId: "my-tenant-id",
 *     supportGroups: true,
 *   },
 * });
 * ```
 *
 * **Example:** Zone-scoped IdP (legacy zone-level Access)
 * ```typescript
 * const zoneIdp = yield* Cloudflare.Access.IdentityProvider("ZoneSso", {
 *   zoneId: zone.zoneId,
 *   type: "github",
 *   config: {
 *     clientId: "my-client-id",
 *     clientSecret: "my-client-secret",
 *   },
 * });
 * ```
 *
 * ### Restricting an Application to an IdP
 * **Example:** Allow only this IdP on an Access application
 * ```typescript
 * yield* Cloudflare.Access.Application("Admin", {
 *   domain: "admin.example.com",
 *   allowedIdps: [oidc.identityProviderId],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/identity/idp-integration/
 *
 * @resource
 * @product Access
 * @category Cloudflare One (Zero Trust)
 */
export const IdentityProvider = Resource(TypeId);
/**
 * Returns true if the given value is an IdentityProvider resource.
 */
export const isIdentityProvider = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const IdentityProviderProvider = () => Provider.succeed(IdentityProvider, {
    stables: ["identityProviderId", "accountId", "zoneId", "type"],
    diff: Effect.fn(function* ({ olds, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        if (!isResolved(news))
            return undefined;
        if ((output?.accountId ?? accountId) !== accountId) {
            return { action: "replace" };
        }
        // Config shapes are disjoint per type — model a type change as a
        // replacement even though the API technically allows the PUT.
        const oldType = output?.type ?? olds?.type;
        if (oldType !== undefined && oldType !== news.type) {
            return { action: "replace" };
        }
        // Scope change (zone <-> account, or a different zone) replaces.
        if (output !== undefined || olds !== undefined) {
            const oldZone = output?.zoneId ?? olds?.zoneId;
            if ((oldZone === undefined) !== (news.zoneId === undefined)) {
                return { action: "replace" };
            }
            // zoneId is Input<string>; compare only once both are concrete.
            if (typeof oldZone === "string" &&
                typeof news.zoneId === "string" &&
                oldZone !== news.zoneId) {
                return { action: "replace" };
            }
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        const zoneId = output?.zoneId ?? olds?.zoneId;
        // Owned path — refresh by the cached id. Carry the SCIM secret
        // forward from prior output; the API never returns it on GET.
        if (output?.identityProviderId) {
            const observed = yield* getIdp(zoneId, acct, output.identityProviderId);
            if (observed) {
                return toAttributes(observed, zoneId, acct, output.scimSecret);
            }
        }
        // Cold read — locate by deterministic name. Access IdPs carry no
        // ownership markers, so report the match as Unowned to gate adoption.
        const name = yield* resolveName(id, olds?.name ?? output?.name);
        let match = yield* findByName(zoneId, acct, name);
        // The singleton types (`cloudflare`, `onetimepin`) exist at most once
        // per scope and their display name is user-irrelevant (the managed
        // WARP IdP's is often "") — locate them by type when the name scan
        // misses so adoption works regardless of the declared name.
        const type = olds?.type ?? output?.type;
        if (!match && isSingletonType(type)) {
            match = yield* findByType(zoneId, acct, type);
        }
        if (match) {
            return Unowned(toAttributes(match, zoneId, acct, output?.scimSecret));
        }
        return undefined;
    }),
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Account-scoped collection — exhaustively paginate the account's
        // identity providers and hydrate each into the `read` Attributes
        // shape. The SCIM secret is masked by the API on list, so it is
        // carried as undefined (there is no prior state to thread through).
        const accountIdps = yield* zeroTrust.listIdentityProvidersForAccount
            .pages({ accountId })
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((idp) => toAttributes(idp, undefined, accountId, undefined)))));
        // Zone-scoped IdPs (legacy zone-level Access) — fan out across the
        // account's zones. Zones without zone-level Access reject the
        // route; skip them.
        const zones = yield* listAllZones(accountId);
        const zoneGroups = yield* Effect.forEach(zones, (zone) => zeroTrust.listIdentityProvidersForZone
            .pages({ zoneId: zone.id })
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((idp) => toAttributes(idp, zone.id, accountId, undefined)))), Effect.catchTag("Forbidden", () => Effect.succeed([]))), { concurrency: 10 });
        // The zone route can echo account-level IdPs back — keep each IdP
        // once, under the scope that owns it.
        const seen = new Set(accountIdps.map((idp) => idp.identityProviderId));
        return [
            ...accountIdps,
            ...zoneGroups.flat().filter((idp) => !seen.has(idp.identityProviderId)),
        ];
    }),
    reconcile: Effect.fn(function* ({ id, news, olds, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // A scope change replaces (see diff), so news' scope is the scope.
        const zoneId = news.zoneId;
        const generatedName = yield* createPhysicalName({ id });
        // 1. Observe — the cached id is a hint; fall back to a name scan
        //    (and, for the singleton types, a type scan) so out-of-band
        //    deletes / lost state converge.
        let observed = output?.identityProviderId
            ? yield* getIdp(zoneId, accountId, output.identityProviderId)
            : undefined;
        if (!observed) {
            observed = yield* findByName(zoneId, accountId, news.name ?? generatedName);
        }
        // Singleton types (`cloudflare`, `onetimepin`) exist at most once per
        // scope — creating a second one is rejected by the API, so an
        // existing one found by type is ours to converge (ownership is gated
        // upstream: `read` reports it as Unowned and the engine only lets
        // reconcile run once adoption is approved).
        if (!observed && isSingletonType(news.type)) {
            observed = yield* findByType(zoneId, accountId, news.type);
        }
        // Singletons keep their observed display name when none is declared —
        // renaming the managed WARP IdP to a generated physical name on
        // adoption would be surprising. Everything else defaults to the
        // deterministic physical name (the resource's cold-read identity).
        const name = news.name ??
            (isSingletonType(news.type) && observed
                ? observed.name
                : generatedName);
        // 2. Ensure — create with the full desired body when missing. Names
        //    are not unique on Cloudflare's side, so there is no
        //    AlreadyExists race to tolerate for the non-singleton types (a
        //    singleton conflict is caught by the type scan above).
        if (!observed) {
            const created = yield* createIdp(zoneId, accountId, {
                name,
                type: news.type,
                config: news.config ?? {},
                scimConfig: news.scimConfig,
                samlCertificateSetId: samlCertificateSetIdOf(news),
            });
            return toAttributes(created, zoneId, accountId, output?.scimSecret);
        }
        // 3. Sync — the update API is a PUT of the full desired state.
        //    Non-secret aspects (name, SCIM enablement) diff against
        //    observed cloud state; the config diffs against the previously
        //    declared props because Cloudflare masks secrets on read.
        const dirty = observed.name !== name ||
            JSON.stringify(news.config ?? {}) !==
                JSON.stringify(olds?.config ?? null) ||
            samlCertificateSetIdOf(news) !== samlCertificateSetIdOf(olds) ||
            (news.scimConfig !== undefined &&
                !sameScim(observed.scimConfig, news.scimConfig));
        if (dirty) {
            const updated = yield* updateIdp(zoneId, accountId, observed.id ?? "", {
                name,
                type: news.type,
                config: news.config ?? {},
                scimConfig: news.scimConfig,
                samlCertificateSetId: samlCertificateSetIdOf(news),
            });
            return toAttributes(updated, zoneId, accountId, output?.scimSecret);
        }
        return toAttributes(observed, zoneId, accountId, output?.scimSecret);
    }),
    delete: Effect.fn(function* ({ output }) {
        // An IdP referenced by an application's `allowedIdps` can fail
        // deletion — applications referencing the id as an Input get correct
        // destroy ordering. A missing IdP (AccessIdentityProviderNotFound,
        // Cloudflare code 12135) means we're done.
        yield* deleteIdp(output.zoneId, output.accountId, output.identityProviderId).pipe(Effect.catchTag("AccessIdentityProviderNotFound", () => Effect.void));
    }),
});
/**
 * The SAML encryption certificate set, when the props are the `saml`
 * variant. Narrowing helper — `samlCertificateSetId` only exists on the
 * SAML member of the props union.
 */
const samlCertificateSetIdOf = (props) => props?.type === "saml" ? props.samlCertificateSetId : undefined;
const createIdp = (zoneId, accountId, body) => zoneId !== undefined
    ? zeroTrust.createIdentityProviderForZone({ zoneId, ...body })
    : zeroTrust.createIdentityProviderForAccount({ accountId, ...body });
const updateIdp = (zoneId, accountId, identityProviderId, body) => zoneId !== undefined
    ? zeroTrust.updateIdentityProviderForZone({
        zoneId,
        identityProviderId,
        ...body,
    })
    : zeroTrust.updateIdentityProviderForAccount({
        accountId,
        identityProviderId,
        ...body,
    });
const deleteIdp = (zoneId, accountId, identityProviderId) => zoneId !== undefined
    ? zeroTrust.deleteIdentityProviderForZone({ zoneId, identityProviderId })
    : zeroTrust.deleteIdentityProviderForAccount({
        accountId,
        identityProviderId,
    });
const resolveName = (id, name) => Effect.gen(function* () {
    // `""` is a legitimate declared name (the managed `cloudflare` IdP's
    // display name is empty) — only generate when no name was declared.
    if (name !== undefined)
        return name;
    return yield* createPhysicalName({ id });
});
const sameScim = (observed, desired) => {
    const o = observed ?? {};
    const sameBool = (a, b) => b === undefined || (a ?? false) === b;
    return (sameBool(o.enabled, desired.enabled) &&
        sameBool(o.seatDeprovision, desired.seatDeprovision) &&
        sameBool(o.userDeprovision, desired.userDeprovision) &&
        (desired.identityUpdateBehavior === undefined ||
            (o.identityUpdateBehavior ?? "no_action") ===
                desired.identityUpdateBehavior));
};
//# sourceMappingURL=IdentityProvider.js.map