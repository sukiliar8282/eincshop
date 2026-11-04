/**
 * Cloudflare expresses an API token's grants as *policies*: one entry per
 * resource scope, each listing the permission groups allowed on it. The
 * catalog hands back a flat list of permission groups, so minting a token
 * means bucketing those groups by the scope they belong to.
 */
/**
 * One `{effect, permissionGroups, resources}` entry in a token's policy list.
 * Mutable to match the shape Cloudflare's create-token request expects.
 */
export interface TokenPolicy {
    effect: "allow";
    permissionGroups: Array<{
        id: string;
    }>;
    resources: Record<string, string>;
}
/** A permission group as returned by Cloudflare's token-permissions catalog. */
export interface PermissionGroup {
    readonly id: string;
    readonly name: string;
    readonly category?: string;
    readonly scopes: ReadonlyArray<string>;
    /** Whether this group's scope maps onto a policy we know how to express. */
    readonly selectable: boolean;
}
/** Scopes we know how to turn into a policy; anything else is not offerable. */
export declare const selectableScopes: ReadonlySet<string>;
/**
 * Bucket permission groups by resource scope into Cloudflare's policy shape.
 * Groups whose scope has no known bucket are dropped — they cannot be granted.
 */
export declare const tokenPolicies: (accountIds: ReadonlyArray<string>, userId: string, groups: ReadonlyArray<PermissionGroup>) => TokenPolicy[];
//# sourceMappingURL=TokenPolicy.d.ts.map