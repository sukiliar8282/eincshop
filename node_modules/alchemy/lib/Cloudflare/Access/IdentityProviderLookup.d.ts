import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import type { IdentityProviderAttributes, IdentityProviderType } from "./IdentityProvider.ts";
export interface ObservedIdp {
    readonly id?: string | null;
    readonly name: string;
    readonly type: string;
    readonly scimConfig?: {
        readonly enabled?: boolean | null;
        readonly identityUpdateBehavior?: string | null;
        readonly scimBaseUrl?: string | null;
        readonly seatDeprovision?: boolean | null;
        readonly secret?: string | null;
        readonly userDeprovision?: boolean | null;
    } | null;
}
/**
 * IdP types that can exist at most once per scope (the managed Cloudflare
 * WARP login method and the built-in one-time PIN). They are located by
 * type — their display name is user-irrelevant and often empty (`""` for
 * the dashboard-provisioned `cloudflare` IdP).
 */
export declare const isSingletonType: (type: IdentityProviderType | undefined) => type is "onetimepin" | "cloudflare";
/**
 * Read an identity provider by id, mapping "gone"
 * (`AccessIdentityProviderNotFound`, Cloudflare error code 12135 —
 * `access.api.error.not_found`) to `undefined`. Zone-level when `zoneId`
 * is set, account-level otherwise.
 */
export declare const getIdp: (zoneId: string | undefined, accountId: string, identityProviderId: string) => Effect.Effect<ObservedIdp | undefined, zeroTrust.Forbidden | zeroTrust.CloudflareOpError, zeroTrust.CloudflareOpContext>;
/**
 * Find the first identity provider in the scope matching a predicate.
 */
export declare const findFirst: (zoneId: string | undefined, accountId: string, predicate: (idp: {
    name: string;
    type: string;
}) => boolean) => Effect.Effect<ObservedIdp | undefined, zeroTrust.ListIdentityProvidersForAccountError, zeroTrust.CloudflareOpContext>;
/**
 * Find an identity provider by exact name within the scope. Names are
 * not unique on Cloudflare's side; pick the first match.
 */
export declare const findByName: (zoneId: string | undefined, accountId: string, name: string) => Effect.Effect<ObservedIdp | undefined, zeroTrust.ListIdentityProvidersForAccountError, zeroTrust.CloudflareOpContext>;
/**
 * Find an identity provider by type within the scope — the identity of
 * the {@link isSingletonType singleton} types, whose display name carries
 * no information.
 */
export declare const findByType: (zoneId: string | undefined, accountId: string, type: IdentityProviderType) => Effect.Effect<ObservedIdp | undefined, zeroTrust.ListIdentityProvidersForAccountError, zeroTrust.CloudflareOpContext>;
export declare const toAttributes: (idp: ObservedIdp, zoneId: string | undefined, accountId: string, priorSecret: Redacted.Redacted<string> | undefined) => IdentityProviderAttributes;
//# sourceMappingURL=IdentityProviderLookup.d.ts.map