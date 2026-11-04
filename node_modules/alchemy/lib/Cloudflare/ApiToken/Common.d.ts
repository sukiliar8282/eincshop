import { type PermissionGroupName } from "./PermissionGroups.ts";
/**
 * Resource keys recognized by Cloudflare API token policies.
 *
 * Cloudflare requires the account ID to be embedded directly in the resource
 * key (e.g. `com.cloudflare.api.account.<accountId>`); pass the fully-qualified
 * key — no rewriting is performed.
 *
 * @see https://developers.cloudflare.com/fundamentals/api/reference/permissions/
 */
export type ResourceKey = `com.cloudflare.api.account.${string}` | `com.cloudflare.api.account.zone.${string}` | `com.cloudflare.edge.r2.bucket.${string}` | (string & {});
/**
 * A permission group reference: either a typed Cloudflare permission-group
 * name (resolved against the static catalog) or an explicit `{ id }` for
 * names that aren't in the catalog or have multiple scopes.
 */
export type PermissionGroupRef = PermissionGroupName | {
    id: string;
    meta?: {
        key?: string;
        value?: string;
    };
};
/**
 * Value of a resource entry in an {@link Policy}. Usually `"*"`, but
 * account-owned tokens must nest zone resources under the account resource —
 * e.g. `{ "com.cloudflare.api.account.<id>": { "com.cloudflare.api.account.zone.*": "*" } }`
 * — so a nested object is also allowed.
 */
export type ResourceScope = string | {
    [K in ResourceKey]?: string;
};
export interface Policy {
    effect: "allow" | "deny";
    permissionGroups: PermissionGroupRef[];
    resources: {
        [K in ResourceKey]?: ResourceScope;
    };
}
export interface Condition {
    requestIp?: {
        in?: string[];
        notIn?: string[];
    };
}
export type Props = {
    /**
     * Token name. Defaults to a generated physical name based on the
     * resource's logical id, app name, and stage.
     */
    name?: string;
    /**
     * The Cloudflare account ID that owns this token. Defaults to the
     * account ID resolved from the ambient {@link CloudflareEnvironment}.
     */
    accountId?: string;
    /**
     * Access policies attached to the token. Cloudflare requires at least one
     * policy on a token; if you omit `policies` here, the policies must instead
     * be contributed by bindings (see {@link ApiTokenBinding}).
     */
    policies?: Policy[];
    /** ISO 8601 expiration timestamp. */
    expiresOn?: string;
    /** ISO 8601 "not before" timestamp. */
    notBefore?: string;
    /** Optional usage conditions (e.g. IP allowlist). */
    condition?: Condition;
};
/**
 * Binding contract for {@link AccountApiToken} / {@link UserApiToken}.
 *
 * A binding contributes additional access policies to the token. This lets a
 * downstream resource (e.g. a runtime capability that needs to call a specific
 * Cloudflare API) create a token and attach exactly the policies it requires,
 * without the token's owner having to enumerate them up front.
 *
 * Binding-contributed policies are merged with any `policies` passed directly
 * as props; the union must contain at least one policy.
 */
export type ApiTokenBinding = {
    /** Access policies to attach to the token. */
    policies?: Policy[];
};
/**
 * Collect the policies a token should be created with: those passed directly
 * as props, plus those contributed by bindings.
 */
export declare const collectPolicies: (props: Policy[] | undefined, bindings: {
    data: ApiTokenBinding;
}[]) => Policy[];
export type ResolvedPolicy = {
    effect: "allow" | "deny";
    permissionGroups: {
        id: string;
        meta?: {
            key?: string;
            value?: string;
        };
    }[];
    resources: Record<string, ResourceScope>;
};
export declare const resolvePermissionGroup: (ref: PermissionGroupRef) => {
    id: string;
    meta?: undefined;
} | {
    id: string;
    meta: {
        key?: string;
        value?: string;
    };
};
export declare const resolvePolicies: (policies: Policy[]) => ResolvedPolicy[];
export declare const policyFingerprint: (policies: ResolvedPolicy[]) => string;
export declare const conditionFingerprint: (condition: Condition | undefined) => string;
export declare const buildConditionPayload: (condition: Condition | undefined) => {
    requestIp: {
        in: string[] | undefined;
        notIn: string[] | undefined;
    } | undefined;
} | undefined;
//# sourceMappingURL=Common.d.ts.map